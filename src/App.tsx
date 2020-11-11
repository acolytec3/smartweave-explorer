import React from 'react';
import {
  theme, Tabs, TabList, TabPanels, Tab, TabPanel, ChakraProvider, Stack, Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, useDisclosure, Heading, Portal, PortalManager, Button
} from '@chakra-ui/core'
import WalletLoader from './components/WalletLoader'
import WalletContext, { initWalletState } from './context/walletContext'
import walletReducer from './reducers/walletReducer'
import Transactions from './components/Transactions';
import { SpeedDial, SpeedDialItem } from './components/SpeedDial'
import Tokens from './components/Tokens';
import { del, get } from 'idb-keyval'
import { addWallet, getTokens } from './providers/wallets'
import { FaWallet, FaUpload } from 'react-icons/fa';
import TransactionDrawer from './components/TransactionDrawer'


function App() {
  const [state, dispatch] = React.useReducer(walletReducer, initWalletState)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [open, setOpen] = React.useState(false)

  const handleClose = () => {
    setOpen(false);
  }
  React.useEffect(() => {
    const loadWallet = async (data: string) => {
      let wallet = JSON.parse(data)
      console.log(JSON.parse(data))
      let walletDeets = await addWallet(wallet)
      let tokens = await getTokens(walletDeets.address);
      dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: wallet,  tokens: tokens } })
    }
    get('wallet').then((data: any) => {
      if (data) {
        try {
          loadWallet(data)
        }
        catch (err) { console.log('Error loading wallet', err) }
      }
    })
  }, [])

  const WalletModal = () => {
    return (<Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Load Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <WalletLoader onClose={onClose} />
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </ModalContent>
    </Modal>
    )
  }

  return (
    <WalletContext.Provider value={{ dispatch, state }}>
      <ChakraProvider theme={theme}>
        <PortalManager >
          <Stack w="100%" align="center" >
            <Heading>ArMob 2.0</Heading>
            <Tabs isFitted align="center" variant="enclosed-colored">
              <TabPanels w="90vw">
                <TabPanel>
                  {state.address !== '' ?
                    <Box>
                      <Tokens />
                    </Box>
                    :
                    <Button onClick={onOpen}>Open Wallet</Button>
                  }
                </TabPanel>
                <TabPanel>
                  {state.address !== '' ?
                    <Transactions />
                    :
                    <Button onClick={onOpen}>Open Wallet</Button>
                  }
                </TabPanel>
              </TabPanels>
              <TabList position="fixed" bottom="0px" left="0px" w="100vw">
                <Tab>Wallet</Tab>
                <Tab>Transactions</Tab>
              </TabList>
            </Tabs>
          </Stack>
          <Portal >
            <SpeedDial>
              {state.address === '' &&
                <SpeedDialItem icon={<FaWallet />} label="Open Wallet" clickHandler={() => {
                  onOpen()
                }} />}
              {state.address !== '' &&
                <SpeedDialItem icon={<FaWallet />} label="Close Wallet" clickHandler={async () => {
                  await del('wallet');
                  dispatch({ type: 'ADD_WALLET', payload: { address: '', balance: '', key: '' } });
                }} />}
               {state.address !== '' && <SpeedDialItem icon={<FaUpload />} label="Upload File" clickHandler={() => setOpen(true)} />
                
              }
            </SpeedDial>
          </Portal>
          <WalletModal />
          <TransactionDrawer isOpen={open} close={handleClose} />
        </PortalManager>
      </ChakraProvider>
    </WalletContext.Provider>
  );
}

export default App;
