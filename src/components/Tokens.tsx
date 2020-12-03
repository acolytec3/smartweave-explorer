import {
    Box, Button,
    Center,
    Divider, FormControl,
    FormErrorMessage, Heading, Icon, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Select, SimpleGrid,
    Spinner, Stack, Text, useToast, VStack
} from '@chakra-ui/core'
import React from 'react'
import { FaCaretRight } from 'react-icons/fa'
import WalletContext, { token } from '../context/walletContext'
import { getFee, sendTokens, getToken, getAllCommunityIds } from '../providers/wallets'
import PSTDrawer from './PSTDrawer'
import TransferModal from './TransactionModal'

interface AddTokenProps {
    close: () => void
}

const AddToken: React.FC<AddTokenProps> = ({ close }) => {
    const { state, dispatch } = React.useContext(WalletContext)
    const [address, setAddress] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [valid, setValid] = React.useState(true)
    const toast = useToast()

    const update = async () => {
        setLoading(true)
        let tokens = [...state.tokens]
        if (state.tokenAddresses && !state.tokenAddresses.find((tokenAddress) => tokenAddress === address))
        {
            try {
            let deets = await getToken(address)
            tokens.push(deets)
            dispatch({ type: 'UPDATE_TOKENS', payload: { tokens: tokens } })
            setAddress('')
            setLoading(false)
            close()
            }
            catch (err) {
                console.log('error adding token')
                console.log(err)
                toast({
                    title: 'Error loading token',
                    status: 'error',
                    duration: 3000,
                    position: 'bottom',
                    description: 'Please check contract ID and try again'
                })
                setAddress('')
                setLoading(false)
                close()
            }
        }
        else toast({
            title: 'Token already in list',
            status: 'error',
            duration: 3000,
            position: 'bottom',
            description: 'Please check contract ID and try again'
        })
        setAddress('')
        setLoading(false)
        close()
    }

    const validateToken = () => {
        console.log(state.tokens)
        if (state.tokens!.find((token) => token && token.hasOwnProperty('contract') && token.contract === address))
            setValid(false)
        else setValid(true)
    }

    return (
        <Stack>
            <Heading size="sm">Add Custom Token</Heading>
            <FormControl isInvalid={!valid}>
                <Stack isInline >
                    <Input placeholder="Contract ID" onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setAddress(evt.target.value) }}
                        onBlur={() => validateToken()} />
                    <Button isDisabled={loading || !valid || address === ''} onClick={() => update()}>Add Token</Button>
                    {loading && <Spinner />}
                </Stack>
                <FormErrorMessage>Token already loaded</FormErrorMessage>
            </FormControl>
        </Stack>
    )
}
const Tokens = () => {
    const { state, dispatch } = React.useContext(WalletContext)
    const [modal, openModal] = React.useState(false)
    const [to, setTo] = React.useState('')
    const [amount, setAmount] = React.useState(0)
    const closeModal = () => openModal(false)
    const [fee, setFee] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [tokensLoading, setTokensLoading] = React.useState(false)
    const toast = useToast();
    const [open, setOpen] = React.useState(false)
    const [currentPST, setPST] = React.useState({})
    const [tokenList, setList] = React.useState(state.tokens)
    const [sortOption, setSort] = React.useState('balances')

    React.useEffect(() => {
        getFee(new Blob([Math.random().toString().slice(-4)]).size).then((fee) => setFee(fee))
    },[])

    React.useEffect(() => {
        if (state.address && state.tokens) 
            switch (sortOption) {
            case 'all': setList(state.tokens.sort((a,b) => {
                if (!b.contractState && !a.contractState) return 0
                let fa= a.ticker.toUpperCase() 
                let fb = b.ticker.toUpperCase()
                if (fa > fb) return 1
                if (fb > fa) return -1
                return 0
            })); break;
            case 'balances': setList(state.tokens.filter((token) => token && token.contractState && token.contractState.balances[state.address] > 0)); break;
            default: setList(state.tokens)
        }
    },[state.tokens, sortOption])

    React.useEffect(() => {
        async function* getTokens() {
          if (state.tokenAddresses) {
            for (let j = 0; j < state.tokenAddresses?.length; j++) {
              if (!state.tokens.find((token) => token.contract === state.tokenAddresses![j])) {
                try {
                  let token = await getToken(state.tokenAddresses[j])
                  yield token
                }
                catch (err) {
                  console.log('error loading token')
                  console.log(err)
                }
              }
            }
          }
        }
    
        const getTokenDeets = async () => {
          let tokens: token[] = []
          setTokensLoading(true)
          for await (let token of getTokens()) {
            console.log(token)
            tokens.push(token)
          }
          setTokensLoading(false)
          dispatch({ type: 'UPDATE_TOKENS', payload: { tokens: tokens } })
        }
    
        getTokenDeets()
      }, [state.tokenAddresses])
    
      React.useEffect(() => {
        const getTokenAddresses = async () => {
          let tokens = await getAllCommunityIds();
          dispatch({ type: 'SET_TOKEN_ADDRESSES', payload: { tokenAddresses: tokens } })
          console.log(state.tokenAddresses)
        }

        console.log(`start showing the skeletor ${tokensLoading}`)
        getTokenAddresses()
      }, [])

    const initTokenTransfer = async (token: token, onClose: any) => {
        setLoading(true)
        let message = await sendTokens(token.contract, amount, to, state.key)
        setLoading(false)
        onClose()
        toast({
            title: `Transaction Status - ${message}`,
            status: 'info',
            duration: 3000,
            position: 'bottom'
        })
    }

    const closePSTDrawer = () => setOpen(false)

    return (<Box textAlign="left">
        <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">Address: {state.address}</Text>
        <SimpleGrid columns={3} my={2} alignItems="center">
            <Text>AR</Text>
            <Text>{parseFloat(state.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</Text>
            <Button isDisabled={!state.key} onClick={() => openModal(true)}>Send</Button>
        </SimpleGrid>
        <Divider my={4} />
        <Heading align="center" size="sm">Profit Sharing Tokens</Heading>
        <Select placeholder="Filtering options" value={sortOption} onChange={(evt) => setSort(evt.target.value)}>
            <option value="all">All tokens</option>
            <option value="balances">Tokens with balances</option>
        </Select>
        <SimpleGrid columns={4}>
            <Text fontWeight="bold" minWidth="150px">Ticker</Text>
            <Text fontWeight="bold">Balance</Text>
        </SimpleGrid>
        {tokensLoading && <Center h="200px">
            <Box align="center">
            <Spinner pb="10px" />
            <Text>Loading tokens...</Text>
            </Box>
        </Center>}
        {tokenList.map((token: token) => {
            if (token && token.ticker) {
                return (
                    <SimpleGrid key={token.contract + 'grid'} borderY="1px" borderColor="lightgray" columns={4} my={2} py={1} alignItems="center">
                        <Text minWidth="150px" onClick={() => { setPST({ ...token.contractState, contractID: token.contract }); setOpen(true) }}>{token.ticker}</Text>
                        <Text minWidth="120px" onClick={() => { setPST({ ...token.contractState, contractID: token.contract }); setOpen(true) }}>{token.contractState.balances[state.address]}</Text>
                        <Popover closeOnBlur={false}>
                            {({ onClose }) =>
                                <>
                                    <PopoverTrigger>
                                        <Button justifySelf="end">Send</Button>
                                    </PopoverTrigger>
                                    <PopoverContent zIndex={4}>
                                        <PopoverArrow />
                                        <PopoverHeader>Send Tokens</PopoverHeader>
                                        <PopoverCloseButton />
                                        <PopoverBody>
                                            <Stack align="center" >
                                                {!loading ?
                                                    <Box>
                                                        <Input my={2}
                                                            placeholder={`Amount`}
                                                            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setAmount(parseFloat(evt.target.value)) }}
                                                        />
                                                        <Input
                                                            placeholder={`Address`} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setTo(evt.target.value) }} />
                                                        <Text textAlign="center">Fee: {fee}</Text>
                                                        <Button isDisabled={!state.key} w="90%" onClick={() => {
                                                            initTokenTransfer(token, onClose);
                                                        }}>Submit Transaction</Button>
                                                    </Box>
                                                    :
                                                    <Box>
                                                        <Spinner />
                                                        <Text>Submitting Transaction</Text>
                                                    </Box>
                                                }</Stack>
                                        </PopoverBody>
                                    </PopoverContent>
                                </>}
                        </Popover>
                        <Icon justifySelf="end" as={FaCaretRight} onClick={() => { setPST({ ...token.contractState, contractID: token.contract }); setOpen(true) }} />
                    </SimpleGrid>
                )
            }
        })
        }
        <TransferModal props={{ modal, closeModal }} />
        <Popover placement="top-end">
            {({ onClose }) => (
                <>
                    <PopoverTrigger>
                        <Button position="fixed" bottom="50px" left="20px">Add Custom Token</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverCloseButton />
                        <PopoverBody>
                            <AddToken close={onClose} />
                        </PopoverBody>
                    </PopoverContent>
                </>)}
        </Popover>
        <PSTDrawer isOpen={open} close={closePSTDrawer} contractState={currentPST} />
    </Box>
    )
}
export default Tokens

//<Icon position="fixed" right="2px" as={FaCaretRight}  />