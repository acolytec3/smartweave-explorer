import {
  Box, ChakraProvider, Heading, Spinner, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, theme
} from '@chakra-ui/core';
import { get } from 'idb-keyval';
import React from 'react';
import { FaCameraRetro, FaUpload } from 'react-icons/fa';
import CameraWindow from './components/Camera';
import SmartweaveExplorer from './components/Smartweave';
import { SpeedDial, SpeedDialItem } from './components/SpeedDial';
import Tokens from './components/Tokens';
import TransactionDrawer from './components/TransactionDrawer';
import Transactions from './components/Transactions';
import WalletLoader from './components/WalletLoader';
import WalletContext, { initWalletState } from './context/walletContext';
import { getBlockHeight } from './providers/wallets';
import walletReducer from './reducers/walletReducer';

function App() {
  const [state, dispatch] = React.useReducer(walletReducer, initWalletState)
  const [open, setOpen] = React.useState(false)
  const [openCamera, setCamera] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  const handleClose = (modal: string) => {
    if (modal === 'txn') setOpen(false);
    if (modal === 'camera') setCamera(false)
  }

  // Retrieves block height for use in calculating approximate vaulted balance times for PSTs
  React.useEffect(() => {
    getBlockHeight().then((res) => dispatch({ type: 'SET_BLOCK_HEIGHT', payload: { blockHeight: res } }))
  }, [])

  React.useEffect(() => {
    get('wallets').then((data: any) => {
      if (data) {
        let loadedState = JSON.parse(data)
        dispatch({ type: 'LOAD_STATE', payload: { state: loadedState}})
      }
      setLoading(false)
    })
  }, [])

  return (
    <WalletContext.Provider value={{ dispatch, state }}>
      <ChakraProvider theme={theme}>
        <Stack w="100%" align="center" >
          <Heading>ArMob 2.0</Heading>
          <Tabs isFitted align="center" variant="enclosed-colored">
            <TabPanels w="90vw">
              <TabPanel>
                <WalletLoader />
              </TabPanel>
              <TabPanel>
                {loading ? <Spinner position="fixed" bottom="50%" right="50%" /> :
                  state.address !== '' &&
                  <Box>
                    <Tokens />
                  </Box>
                }
              </TabPanel>
              <TabPanel>
                {state.address !== '' &&
                  <Transactions />
                }
              </TabPanel>
              <TabPanel>
                <SmartweaveExplorer />
              </TabPanel>
            </TabPanels>
            <TabList position="fixed" bottom="0px" left="0px" w="100vw">
              <Tab>Wallet</Tab>
              <Tab isDisabled={state.address === ''}>Tokens</Tab>
              <Tab isDisabled={state.address === ''}>Transactions</Tab>
              <Tab isDisabled={state.key === ''}>Smartweave</Tab>
            </TabList>
          </Tabs>
        </Stack>
        {state.key && <SpeedDial>
          {state.key && <SpeedDialItem key='faupload' icon={<FaUpload />} label="Upload File" clickHandler={() => setOpen(true)} />
          }
          {state.key && <SpeedDialItem key='facameretro' icon={<FaCameraRetro />} label="Take Picture" clickHandler={() => setCamera(true)} />}
        </SpeedDial>}
        <TransactionDrawer isOpen={open} close={() => handleClose('txn')} />
        <CameraWindow isOpen={openCamera} close={() => handleClose('camera')} setTxnOpen={() => setOpen(true)} />
      </ChakraProvider>
    </WalletContext.Provider>
  );
}

export default App;
