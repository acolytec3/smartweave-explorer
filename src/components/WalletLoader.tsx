import React from 'react';
import Dropzone from 'react-dropzone'
import { Box, Button, Input, Spinner, Stack, Text, useToast } from '@chakra-ui/core'
import { get, set } from 'idb-keyval'
import { addWallet, getTokens, updateTokens } from '../providers/wallets'
import WalletContext from '../context/walletContext'
import { getKeyFromMnemonic } from 'arweave-mnemonic-keys'

const WalletLoader = (props: any) => {
  const toast = useToast()
  const { dispatch } = React.useContext(WalletContext)
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
          //TODO: decide if this is the right approach to retrieving tokens
          let tokenObject = await get('tokens')
          let tokens
          if (tokenObject && typeof tokenObject === 'string')
            tokens = await updateTokens(JSON.parse(tokenObject), walletDeets.address)
          else  
            tokens = await getTokens(walletDeets.address);
          await set('wallet', JSON.stringify(walletObject))
          await set('tokens', JSON.stringify(tokens))
          props.onClose();
          dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: walletObject, tokens: tokens } })
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
    let tokens = await getTokens(walletDeets.address);
    await set('wallet', JSON.stringify(walletObject))
    setLoading(false)
    props.onClose();
    dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: walletObject, tokens: tokens } })
  }

  const addAddress = async () => {
    setLoading(true)
    let walletDeets = await addWallet(address);
    let tokens = await getTokens(address);
   // await set('wallet', address)
    dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: '', tokens: tokens } })
    props.onClose();
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
  </Stack>
  )
}

export default WalletLoader