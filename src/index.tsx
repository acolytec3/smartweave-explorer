import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ChakraProvider, theme } from '@chakra-ui/react';

ReactDOM.render(
  <React.StrictMode>
          <ChakraProvider theme={theme}>
    <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

