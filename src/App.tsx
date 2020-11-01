import React from 'react';
import { theme, Tabs, TabList, TabPanels, Tab, TabPanel, Text, ThemeProvider, Stack } from '@chakra-ui/core'
import WalletLoader from './components/WalletLoader'
import WalletContext, { initWalletState } from './context/walletContext'
import walletReducer from './reducers/walletReducer'
import Transactions from './components/Transactions';
import SpeedDial from './components/SpeedDial'

function App() {
  const [state, dispatch] = React.useReducer(walletReducer, initWalletState)

  return (
    <WalletContext.Provider value={{ dispatch, state }}>
      <ThemeProvider theme={theme}>
        <Stack w="100%" align="center" >
          <Stack isInline>
            <Text>Armob V2</Text>
            {state.balance !== '' && <Text justifySelf="end">Balance: {state.balance}</Text>}</Stack>
          <Tabs isFitted align="center">
            <TabPanels>
              <TabPanel>
                {state.address === '' ? <WalletLoader /> : <Transactions />}
              </TabPanel>
              <TabPanel>
                <Text>Transactions</Text>
              </TabPanel>
              <TabPanel>
                <Text>Browser</Text>
              </TabPanel>
            </TabPanels>
            <TabList position="fixed" bottom="0px" left="0px" w="100vw">
              <Tab>Wallet</Tab>
              <Tab>Transactions</Tab>
              <Tab>Browser</Tab>
            </TabList>
          </Tabs>
        </Stack>
        <SpeedDial />
      </ThemeProvider>
    </WalletContext.Provider>
  );
}

export default App;
