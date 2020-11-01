import React from 'react';
import Dropzone from 'react-dropzone'
import { Box, Stack, Text, useToast } from '@chakra-ui/core'
import { get, set} from 'idb-keyval'
import { addWallet } from '../providers/wallets'
import WalletContext from '../context/walletContext'

const WalletLoader = () => {
  const toast = useToast()
  const { state, dispatch } = React.useContext(WalletContext)

  React.useEffect(() => {
    const loadWallet = async (data: string) => {
      let wallet = JSON.parse(data)
      console.log(JSON.parse(data))
      let walletDeets = await addWallet(wallet)
      dispatch({ type: 'ADD_WALLET', payload: { ...walletDeets, key: wallet } })
    }
    get('wallet').then((data : any) => {
    if (data) {
      try{
      loadWallet(data)
      }
      catch (err) { console.log('Error loading wallet', err)}
    }})
  },[])

  const onDrop = async (acceptedFiles: any) => {
    const reader = new FileReader()
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = async function (event) {
      if (acceptedFiles[0].type === "application/json") {
        try {
          let walletObject = JSON.parse(event!.target!.result as string)
          let walletDeets = await addWallet(walletObject)
          await set('wallet', JSON.stringify(walletObject))
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

  return (<Box>
    {state.address === '' ? <Box w="100%" borderStyle='dashed' borderWidth="2px">
      <Dropzone onDrop={onDrop} >
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
      :
      <Stack isInline><Text>{state.address}</Text><Text>{parseFloat(state.balance).toFixed(4).toLocaleString()} AR</Text></Stack>}</Box>
  )
}

export default WalletLoader