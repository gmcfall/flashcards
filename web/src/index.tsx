import { createTheme, ThemeProvider } from '@mui/material/styles';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ZAuth from './components/ZAuth';
import ZDeckEditor from './components/ZDeckEditor';
import ZDeckPlayer from './components/ZDeckPlayer';
import ZDeckShare from './components/ZDeckShare';
import ZHome from './components/ZHome';
import ZLibrary from './components/ZLibrary';
import ZRegistrationProvider from './components/ZRegistrationProvider';
import ZSigninProvider from './components/ZSigninProvider';
import { FirebaseProvider } from './fbase/FirebaseContext';
import './index.css';
import firebaseApp from './model/firebaseApp';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = createTheme({
  typography: {
    h1: {
      fontSize: "2rem"
    },
    subtitle1: {
      fontWeight: "500",
      fontSize: "110%"
    },
    body2: {
      fontSize: "0.8rem"
    }
  }
})

// We don't use React.Strict mode because it simulates a future feature by unmounting and then
// mounting again each component.  The result is that useEffect will run twice even if its 
// dependencies don't change. 
//
// For more information see https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-strict-mode

const DeckEditor = <ZDeckEditor/>;
const DeckPlayer = <ZDeckPlayer/>;
const DeckShare = <ZDeckShare/>;

root.render(
  <ThemeProvider theme={theme}>
    <FirebaseProvider firebaseApp={firebaseApp}>
      <ZRegistrationProvider>
        <ZSigninProvider>
          <ZAuth/>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ZHome/>}/>
              <Route path="/library" element={<ZLibrary/>}/>
              <Route path="/decks/:deckId/edit" element={DeckEditor}/>
              <Route path="/decks/:deckId/edit/:cardIndex" element={DeckEditor}/>
              <Route path="/decks/:deckId/view" element={DeckPlayer}/>
              <Route path="/decks/:deckId/view/:cardIndex" element={DeckPlayer}/>
              <Route path="/decks/:deckId/share" element={DeckShare}/>
            </Routes>
          </BrowserRouter>
        </ZSigninProvider>
      </ZRegistrationProvider>
    </FirebaseProvider>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
