import {
  Box, Button, ChakraProvider, Heading, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Spinner, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, theme, useDisclosure
} from '@chakra-ui/core';
import { del, get } from 'idb-keyval';
import React from 'react';
import { FaCameraRetro, FaUpload, FaWallet } from 'react-icons/fa';
import CameraWindow from './components/Camera';
import { SpeedDial, SpeedDialItem } from './components/SpeedDial';
import Tokens from './components/Tokens';
import TransactionDrawer from './components/TransactionDrawer';
import Transactions from './components/Transactions';
import WalletLoader from './components/WalletLoader';
import WalletContext, { initWalletState, tokenBalance } from './context/walletContext';
import { addWallet, getBlockHeight, getAllCommunityIds, getToken } from './providers/wallets';
import walletReducer from './reducers/walletReducer';


function App() {
  const [state, dispatch] = React.useReducer(walletReducer, initWalletState)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [open, setOpen] = React.useState(false)
  const [openCamera, setCamera] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  const handleClose = (modal: string) => {
    if (modal === 'txn') setOpen(false);
    if (modal === 'camera') setCamera(false)
  }

  React.useEffect(() => {
    getBlockHeight().then((res) => dispatch({ type: 'SET_BLOCK_HEIGHT', payload: { blockHeight: res } }))
  }, [])

  React.useEffect(() => {
    const getTokenDeets = async () => {
    let token = state.tokens.find((token) => token.contract && token.ticker === '')
    if (token) {
      let tokens = state.tokens.filter((token2) => token2.contract !== token!.contract)
      let tokenDeets = await getToken(token.contract)
      if (state.address) {
        tokenDeets.balance = tokenDeets.contractState.balances[state.address] ?
        tokenDeets.contractState.balances[state.address]:0
      }
      dispatch({ type: 'UPDATE_TOKENS', payload: { tokens: [...tokens, tokenDeets] } })
    }}
    getTokenDeets()
  },[state.tokens])

  React.useEffect(() => {
    const getTokenAddresses = async () => {
      let tokens = await getAllCommunityIds();
      dispatch({ type: 'SET_TOKEN_ADDRESSES', payload: { tokenAddresses: tokens } })
      console.log(state.tokenAddresses)
      let tokenDeets = tokens.map((address) => { return { ticker: '', contract: address, balance: 0, contractState: null}})
      dispatch({ type: 'UPDATE_TOKENS', payload: { tokens: tokenDeets } })
    }
    getTokenAddresses()
  }, [])

  React.useEffect(() => {
    const loadWallet = async (data: string) => {
      let wallet = JSON.parse(data)
      let walletDeets = await addWallet(wallet)
      dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: wallet } })
      setLoading(false)
    }
    get('wallet').then((data: any) => {
      if (data) {
        try {
          loadWallet(data)
        }
        catch (err) { console.log('Error loading wallet', err) }
      }
      else setLoading(false)
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
        <Stack w="100%" align="center" >
          <Heading>ArMob 2.0</Heading>
          <Tabs isFitted align="center" variant="enclosed-colored">
            <TabPanels w="90vw">
              <TabPanel>
                {loading ? <Spinner position="fixed" bottom="50%" right="50%" /> :
                  state.address !== '' ?
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
        <SpeedDial>
          {state.address === '' &&
            <SpeedDialItem icon={<FaWallet />} label="Open Wallet" clickHandler={() => {
              onOpen()
            }} />}
          {state.address !== '' &&
            <SpeedDialItem key='fawallet' icon={<FaWallet />} label="Close Wallet" clickHandler={async () => {
              await del('wallet');
              dispatch({ type: 'ADD_WALLET', payload: { address: '', balance: '', key: '' } });
            }} />}
          {state.key && <SpeedDialItem key='faupload' icon={<FaUpload />} label="Upload File" clickHandler={() => setOpen(true)} />
          }
          {state.key && <SpeedDialItem key='facameretro' icon={<FaCameraRetro />} label="Take Picture" clickHandler={() => setCamera(true)} />}
        </SpeedDial>
        <WalletModal />
        <TransactionDrawer isOpen={open} close={() => handleClose('txn')} />
        <CameraWindow isOpen={openCamera} close={() => handleClose('camera')} setTxnOpen={() => setOpen(true)} />
      </ChakraProvider>
    </WalletContext.Provider>
  );
}

export default App;
