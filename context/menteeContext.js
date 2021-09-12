import { firestore } from '@utils/firebase';
const { createContext, useState, useEffect } = require('react');

const MenteeContext = createContext({
  mentee: [],
  setMentee: () => {},
  getMentee: () => {},
  updateMentee: () => {},
});

export const MenteeContextProvider = ({ children }) => {
  const [mentee, setMentee] = useState(null);

  const getMentee = async () => {
    const snapshot = await firestore.collection('mentee').get();
    const mentee = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

    return mentee;
  };

  const updateMentee = async (id, data) => {
    try {
      await firestore.collection('mentee').doc(id).update(data);
      
      setMentee((curEl) => {
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
      <MenteeContext.Provider value={{
          mentee,
          setMentee,
          getMentee,
          updateMentee,
      }}>
          {children}
      </MenteeContext.Provider>
  );
}

export default MenteeContext;