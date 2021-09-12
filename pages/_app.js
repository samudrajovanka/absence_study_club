import '../styles/globals.scss'
import CssBaseline from '@material-ui/core/CssBaseline';
import { MeetingsContextProvider } from 'context/meetingsContext';
import { MenteeContextProvider } from 'context/menteeContext';

function MyApp({ Component, pageProps }) {
  return (
    <MeetingsContextProvider>
      <MenteeContextProvider>
        <main>
          <CssBaseline />
          <Component {...pageProps} />  
        </main>
      </MenteeContextProvider>
    </MeetingsContextProvider>
  );
}

export default MyApp
