import Head from 'next/head';
import styles from '@styles/HomePage.module.scss';
import { Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@material-ui/core';
import { useContext, useEffect, useRef, useState } from 'react';
import { firestore } from '@utils/firebase';
import Link from 'next/link';
import moment from 'moment';
import MeetingsContext from '@context/meetingsContext';
import MenteeContext from '@context/menteeContext';

function HomePage({ initMeetings, initMentee, initPresenceMentee }) {
  const name = useRef(null);
  const meetingsCtx = useContext(MeetingsContext);
  const menteeCtx = useContext(MenteeContext);
  const meetings = meetingsCtx?.meetings ?? initMeetings;
  const mentee = menteeCtx?.mentee ?? initMentee;
  const [helperTextName, setHelperTextName] = useState('');
  const [errorNameInput, setErrorNameInput] = useState(false);
  const [textNotification, setTextNotification] = useState('');
  const [presenceMentee, setPresenceMentee] = useState(initPresenceMentee);

  useEffect(() => {
    meetingsCtx.setMeetings(initMeetings);
    menteeCtx.setMentee(initMentee);
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (meetings) {
        const nextDate = meetings[0].next.date;
        const currentDate = moment().format('DD-MM-YYYY');

        const nextTimeStart = meetings[0].next.start;
        const nextTimeEnd = meetings[0].next.end;

        const currentTime = moment().format('HH:mm');
        const second = moment().format('ss');

        if (nextDate === currentDate) {
          if (nextTimeStart === currentTime && second === '00') {
            try {
              meetingsCtx.updateMeetings(meetings[0].id, {
                next: {
                  ...meetings[0].next,
                  status: 'ongoing',
                }
              });
              console.log('success')
            } catch (error) {
              console.log(error);
            }
          } else if (nextTimeEnd === currentTime && second === '00') {
            try {

              await meetingsCtx.updateMeetings(meetings[0].id, {
                next: {
                  ...meetings[0].next,
                  status: 'closed',
                }
              });
              console.log('success')
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const menteePresenceCurrent = mentee.filter((d) => d.presence[meetings[0].next.number - 1]);
    setPresenceMentee(menteePresenceCurrent);
  }, [menteeCtx.mentee]);

  useEffect(async () => {
    if (meetings[0].next.status === 'closed') {
      try {
        mentee.map(async (d, i) => {
          if (!d.presence[meetings[0].next.number - 1] && d.presence.length < meetings[0].next.number) {
            await menteeCtx.updateMentee(d.id, {
              presence: [
                ...d.presence,
                false,
              ],
            });
          }
        });
        console.log('success update mentee')

        await meetingsCtx.updateMeetings(meetings[0].id, {
          next: {},
          previous: [
            ...meetings[0].previous,
            {
              date: meetings[0].next.date,
              number: meetings[0].next.number,
              totalAttendance: menteeCtx?.mentee.filter((d) => d.presence[meetings[0].next.number - 1]).length,
            }
          ]
        });
        console.log('success update meetings')
      } catch (error) {
        console.log(error);
      }
    }
  }, [meetings]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setTextNotification('');

    const inputNameRef = name.current.childNodes[1].childNodes[0];
    const nameValue = inputNameRef.value;

    const dataMentee = menteeCtx.mentee.filter((d) => d.name === nameValue);

    if (dataMentee.length > 0) {
      if (dataMentee[0].presence[meetings[0].next.number - 1]) {
        setErrorNameInput(true);
        setHelperTextName('Anda sudah melakukan Absen');
      } else {
        setHelperTextName('');
        setErrorNameInput(false);
        inputNameRef.value = '';
        setTextNotification('Loading...');

        await menteeCtx.updateMentee(dataMentee[0].id, {
          presence: [
            ...dataMentee[0].presence,
            true,
          ]
        });

        setTextNotification('Data berhasil disimpan');
      }
    } else {
      setHelperTextName('Nama tidak terdaftar');
      setErrorNameInput(true);
    }
  }

  return (
    <>
      <Head>
        <title>Absensi SC Web Basic</title>
      </Head>
      
      <div className={styles.container}>
        <h1 align="center">Absensi SC Web Basic</h1>

        {meetings && meetings[0].next.status === 'oncoming' && (
          <Grid container alignItems="center" justifyContent="space-between" direction="column-reverse">
            <Grid item>
              <h3 align="center">Akan datang pertemuan {meetings[0].next.number}</h3>

              <Grid container justifyContent="space-between">
                <Grid item>
                  <p>Tanggal</p>
                  <p>Mulai</p>
                  <p>Selesai</p>
                </Grid>
                <Grid item>
                  <p align="right">{meetings[0].next.date}</p>
                  <p align="right">{meetings[0].next.start}</p>
                  <p align="right">{meetings[0].next.end}</p>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Link href="/presences">Lihat Semua &raquo;</Link>
            </Grid>
          </Grid>
        )}

        {meetings && meetings[0].next.status === 'ongoing' && (
          <>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <h3 align="center">Pertemuan {meetings[0].next.number}</h3>
              </Grid>
              <Grid item>
                <Link href="/presences">Lihat Semua &raquo;</Link>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <form autoComplete="off" className={styles.form_container} onSubmit={onSubmit}>
                  <TextField
                    error={errorNameInput}
                    helperText={helperTextName}
                    id="mentee_name"
                    label="Nama"
                    variant="outlined"
                    required
                    fullWidth
                    ref={name}
                  />
                  <Button type="submit" variant="contained" color="primary">Hadir</Button>
                  {textNotification && (
                    <p className={styles.success_notification}>{textNotification}</p>
                  )}
                </form>
              </Grid>

              <Grid item xs={12} sm={6}>
                <h3>Data yang sudah masuk</h3>
                
                <TableContainer component={Paper}>
                  <Table aria-label="table data yang sudah masuk">
                    <TableHead>
                      <TableRow>
                        <TableCell width={20}>No</TableCell>
                        <TableCell>Nama</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {presenceMentee.map((d, index) => (
                        <TableRow key={d.id}>
                          <TableCell>
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            {d.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </>
        )}

      </div>
    </>
  );
}

export async function getStaticProps() {
  const snapshotMeetings = await firestore.collection('meetings').get();
  const meetings = snapshotMeetings.docs.map(doc => ({id: doc.id, ...doc.data()}));
  
  const snapshotMentee = await firestore.collection('mentee').get();
  const mentee = snapshotMentee.docs.map(doc => ({id: doc.id, ...doc.data()}));

  const presenceMentee = mentee.filter((d) => d.presence[meetings[0].next.number - 1]);

  return {
    props: {
      initMeetings: meetings,
      initMentee: mentee,
      initPresenceMentee: presenceMentee,
    },
    revalidate: 60,
  }
}

export default HomePage;
