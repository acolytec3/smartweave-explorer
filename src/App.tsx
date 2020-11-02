import React from 'react';
import {
  theme, Tabs, TabList, TabPanels, Tab, TabPanel, Text, ThemeProvider, Stack, Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, useDisclosure
} from '@chakra-ui/core'
import WalletLoader from './components/WalletLoader'
import WalletContext, { initWalletState } from './context/walletContext'
import walletReducer from './reducers/walletReducer'
import Transactions from './components/Transactions';
import SpeedDial from './components/SpeedDial'
import Tokens from './components/Tokens';

function App() {
  const [state, dispatch] = React.useReducer(walletReducer, initWalletState)
  const [walletModal, openModal] = React.useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure();


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
      <ThemeProvider theme={theme}>
        <Stack w="100%" align="center" >
          <Stack isInline>
            <Text>Armob V2</Text>
            {state.balance !== '' && <Text justifySelf="end">Balance: {parseFloat(state.balance).toFixed(4).toLocaleString()} AR</Text>}</Stack>
          <Tabs isFitted align="center">
            <TabPanels>
              <TabPanel>
                {state.address !== '' &&
                  <Box>
                    {state.tokens && state.tokens.length > 0 && <Tokens />}
                    <Transactions />
                  </Box>}
              </TabPanel>
              <TabPanel>
                <Text>Browser</Text>
              </TabPanel>
            </TabPanels>
            <TabList position="fixed" bottom="0px" left="0px" w="100vw">
              <Tab>Wallet</Tab>
              <Tab>Browser</Tab>
            </TabList>
          </Tabs>
        </Stack>
        {/* @ts-ignore 8*/}
        <SpeedDial onOpen={onOpen} />
        <WalletModal />
      </ThemeProvider>
    </WalletContext.Provider>
  );
}

export default App;
