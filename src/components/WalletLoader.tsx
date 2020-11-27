import React from 'react';
import Dropzone from 'react-dropzone'
import { Box, Button, Divider, Heading, Input, Spinner, Stack, Text, useToast } from '@chakra-ui/core'
import { set } from 'idb-keyval'
import { addWallet } from '../providers/wallets'
import WalletContext from '../context/walletContext'
import { getKeyFromMnemonic } from 'arweave-mnemonic-keys'
import { FaCheck, FaTrash } from 'react-icons/fa';

const WalletLoader = (props: any) => {
  const toast = useToast()
  const { state, dispatch } = React.useContext(WalletContext)
  const [loading, setLoading] = React.useState(false)
  const [address, setAddress] = React.useState('')

  const onDrop = async (acceptedFiles: any) => {
    const reader = new FileReader()
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = async function (event) {
      setLoading(true)
      if (acceptedFiles[0].type === "application/json") {
        try {
          let walletObject = JSON.parse(event!.target!.result as string)
          let walletDeets = await addWallet(walletObject)
          await set('wallet', JSON.stringify(walletObject))
          //props.onClose();
          dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: walletObject } })
        }
        catch (err) {
          console.log('Invalid json in wallet file')
          toast({
            title: 'Error loading wallet',
            status: 'error',
            duration: 3000,
            position: 'bottom-left',
            description: 'Invalid JSON in wallet file'
          })
        }
      }
      else {
        console.log('Invalid file type')
        toast({
          title: 'Error loading wallet',
          status: 'error',
          duration: 3000,
          position: 'bottom-left',
          description: 'Invalid file type'
        })
      }
      setLoading(false)
    }
    try {
      reader.readAsText(acceptedFiles[0])
    }
    catch (err) {
      console.log('Invalid file type')
      toast({
        title: 'Error loading wallet',
        status: 'error',
        duration: 3000,
        position: 'bottom-left',
        description: 'Invalid file type'
      })
    }
  }

  const loadWalletFromMnemonic = async (mnemonic: string) => {
    setLoading(true)
    let walletObject = await getKeyFromMnemonic(mnemonic);
    let walletDeets = await addWallet(walletObject);
    await set('wallet', JSON.stringify(walletObject))
    setLoading(false)
    props.onClose();
    dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: walletObject, tokens: [] } })
  }

  const addAddress = async () => {
    setLoading(true)
    let walletDeets = await addWallet(address);
    // await set('wallet', address)
    dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: '', tokens: [] } })
    props.onClose();
  }

  const switchWallet = async (address: string) => {
    let wallet = await addWallet(address)
    dispatch({ type: 'CHANGE_ACTIVE_WALLET', payload: { address: wallet.address, balance: wallet.balance } })
  }
  return (<Stack align="center">
    {loading ? <Spinner /> :
      <Box w="100%" borderStyle='dashed' borderWidth="2px">
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Box flexDirection="row" padding={3}><Text fontSize={14} textAlign="center">Drop a wallet file or click to load wallet</Text></Box>
              </div>
            </section>
          )}
        </Dropzone>
      </Box>
    }
    {!loading && <Stack w="100%">
      <Input w="93%%" placeholder="Wallet mnemonic" onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setAddress(evt.target.value) }} />
      <Button isDisabled={(address === '')} onClick={() => loadWalletFromMnemonic(address)}>Load Wallet</Button>
    </Stack>}
    {!loading && <Stack w="100%">
      <Input w="93%%" placeholder="Read-only wallet address" onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setAddress(evt.target.value) }} />
      <Button isDisabled={(address === '')} onClick={() => addAddress()}>Track Address</Button>
    </Stack>}
    {state.address && <>
      <Divider />
      <Heading size="sm">Loaded Wallets</Heading>
    </>}
    {state.wallets.length > 0 && state.wallets.map((wallet) => {
      console.log(wallet)
      return (<Stack isInline align="start">
        <Text whiteSpace="nowrap" overflow="hidden" maxWidth="200px" textOverflow="ellipsis">Address: {wallet.address}</Text>
        <Stack isInline justifyContent="space-around">
          <Box key={wallet.address + 'pseudo2'} as="button" onClick={() => {
            switchWallet(wallet.address) }}
            alignContent="start">
            <FaCheck size={16} />
            <Text>Use</Text></Box>
          <Box as="button" onClick={() => {
            dispatch({ type: 'REMOVE_WALLET', payload: { address: wallet.address } })
          }}>
            <FaTrash size={16} />
            <Text>Remove</Text></Box>
        </Stack></Stack>)})}
      </Stack>
      )
    }

export default WalletLoader