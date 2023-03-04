import { FirebaseProvider } from '@gmcfall/react-firebase-state';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppProps } from 'next/app';
import dynamic from "next/dynamic";
import ZAuth from '../components/ZAuth';
import ZRegistrationProvider from '../components/ZRegistrationProvider';
import ZSigninProvider from '../components/ZSigninProvider';
import '../styles/global.css';
import firebaseApp from '../model/firebaseApp';

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


const App = (props: AppProps) => {
    const {Component, pageProps} = props;

    return (
        <ThemeProvider theme={theme}>
          <FirebaseProvider firebaseApp={firebaseApp}>
            <ZRegistrationProvider>
              <ZSigninProvider>
                <ZAuth/>
                <Component {...pageProps}/>
              </ZSigninProvider>
            </ZRegistrationProvider>
          </FirebaseProvider>
        </ThemeProvider>
    )

}

// The following use of `dynamic` disables Server-Side Rendering for the entire app.

export default dynamic(() => Promise.resolve(App), {ssr: false}); 
