import { firestore } from '@utils/firebase';
const { createContext, useState, useEffect } = require('react');

const MeetingsContext = createContext({
  meetings: [],
  setMeetings: () => {},
  getMeetings: () => {},
  updateMeetings: () => {},
});

export const MeetingsContextProvider = ({ children }) => {
  const [meetings, setMeetings] = useState(null);

  const getMeetings = async () => {
    const snapshot = await firestore.collection('meetings').get();
    const meetings = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

    return meetings;
  };

  const updateMeetings = async (id, data) => {
    try {
      await firestore.collection('meetings').doc(id).update(data);
      
      setMeetings((curEl) => {
        const index = curEl.findIndex((el) => el.id === id);
        const newEl = [...curEl];
        newEl[index] = {
          ...newEl[index],
          ...data,
        };

        return newEl;
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
      <MeetingsContext.Provider value={{
          meetings,
          setMeetings,
          getMeetings,
          updateMeetings
      }}>
          {children}
      </MeetingsContext.Provider>
  );
}

export default MeetingsContext;