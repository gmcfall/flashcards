import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ZAuth from './components/ZAuth';
import ZDeckEditor from './components/ZDeckEditor';
import ZHome from './components/ZHome';
import ZLibrary from './components/ZLibrary';
import './index.css';
import reportWebVitals from './reportWebVitals';
import store from './store/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = createTheme({
  typography: {
    h1: {
      fontSize: "2rem"
    },
    subtitle1: {
      fontWeight: "bold"
    }
  }
})


root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ZAuth/>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ZHome/>}/>
            <Route path="/library" element={<ZLibrary/>}/>
            <Route path="/decks/:deckId/edit" element={<ZDeckEditor/>}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
