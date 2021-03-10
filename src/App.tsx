import {
  Heading, Stack, Tab, TabList, TabPanel, TabPanels, Tabs
} from '@chakra-ui/react';

import React from 'react';
import SmartweaveExplorer from './components/Smartweave';
import WalletLoader from './components/WalletLoader';
import WalletContext, { initWalletState } from './context/walletContext';
import walletReducer from './reducers/walletReducer';

function App() {
  const [state, dispatch] = React.useReducer(walletReducer, initWalletState)

  return (
    <WalletContext.Provider value={{ dispatch, state }}>
        <Stack w="100%" align="center" >
          <Heading>ArMob 2.0</Heading>
          <Tabs isFitted align="center" variant="enclosed-colored">
            <TabPanels w="100vw">
              <TabPanel>
                <WalletLoader />
              </TabPanel>
              <TabPanel>
                <SmartweaveExplorer />
              </TabPanel>
            </TabPanels>
            <TabList position="fixed" bottom="0px" left="0px" w="100vw">
              <Tab>Wallet</Tab>
              <Tab isDisabled={state.key === ''}>Smartweave</Tab>
            </TabList>
          </Tabs>
        </Stack>
    </WalletContext.Provider>
  );
}

export default App;
