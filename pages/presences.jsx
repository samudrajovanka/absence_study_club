import Head from 'next/head';
import styles from '@styles/PresencesPage.module.scss';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { firestore } from '@utils/firebase';
import Link from 'next/link';

function PresencesPage({ mentee }) {
  return (
    <>
      <Head>
        <title>Daftar Hadir</title>
      </Head>

      <div className={styles.container}>
        <Link href="/">&laquo; Home</Link>
        <h1 align="center">Daftar Hadir Web Basic</h1>

        {mentee && (
          <TableContainer component={Paper}>
            <Table aria-label="table data yang sudah masuk">
              <TableHead>
                <TableRow>
                  <TableCell width={20}>No</TableCell>
                  <TableCell>Nama</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>6</TableCell>
                  <TableCell>7</TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>9</TableCell>
                  <TableCell>10</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mentee.map((data, i) => (
                  <TableRow key={i.toString()}>
                    <TableCell component="th" scope="row">
                      {i + 1}
                    </TableCell>
                    <TableCell align="left">{data.name}</TableCell>

                    {data.presence.map((dataPresence, j) => (
                      <TableCell key={j.toString()} align="center" className={styles[`data_${dataPresence ? 'success' : 'danger'}`]} />
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      </div>
    </>
  );
}

export async function getStaticProps() {
  const snapshot = await firestore.collection('mentee').get();
  const mentee = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

  return {
    props: {
      mentee,
    },
    revalidate: 60,
  }
}

export default PresencesPage;
