import React from 'react'
import WalletContext, { tokenBalance } from '../context/walletContext'
import {
    Box, Button, Heading, SimpleGrid, Text, Popover, PopoverTrigger, Input, PopoverArrow, PopoverBody, PopoverContent, PopoverCloseButton, PopoverHeader, useToast, FormControl,
       FormErrorMessage, Spinner, Stack, Divider
} from '@chakra-ui/core'
import TransferModal from './TransactionModal'
import { sendTokens, getFee, updateTokens } from '../providers/wallets'

const AddToken = () => {
    const { state, dispatch } = React.useContext(WalletContext)
    const [address, setAddress] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [valid, setValid] = React.useState(true)

    const update = async () => {
        setLoading(true)
        let tokens = [...state.tokens]
        if (tokens.filter((token) => token.contract === address).length === 0) {
            tokens.push({ contract: address, balance: 0, ticker: '' })
            let updatedTokens = await updateTokens(tokens, state.address)
            console.log(updatedTokens)
            dispatch({ type: 'UPDATE_TOKENS', payload: { tokens: updatedTokens } })
            setAddress('')
        }
        setLoading(false)
    }

    const validateToken = () => {
        if (state.tokens!.filter((token) => token.contract === address).length > 0)
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
                    <Button isDisabled={loading} onClick={() => update()}>Add Token</Button>
                    {loading && <Spinner />}
                </Stack>
                <FormErrorMessage>Token already loaded</FormErrorMessage>
            </FormControl>


        </Stack>
    )
}
const Tokens = () => {
    const { state } = React.useContext(WalletContext)
    const [modal, openModal] = React.useState(false)
    const [to, setTo] = React.useState('')
    const [amount, setAmount] = React.useState(0)
    const closeModal = () => openModal(false)
    const [fee, setFee] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const toast = useToast();

    React.useEffect(() => {
        getFee(new Blob([Math.random().toString().slice(-4)]).size).then((fee) => setFee(fee))
    })

    const initTokenTransfer = async (token: tokenBalance, onClose: any) => {
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
    return (<Box>
        <Heading size="sm">Wallet Balances</Heading>
        <Text>Address: {state.address}</Text>
        <SimpleGrid columns={3}>
            <Text fontWeight="bold">Ticker</Text>
            <Text fontWeight="bold">Balance</Text>
        </SimpleGrid>
        <Divider />
        <SimpleGrid columns={3}>
            <Text>AR</Text>
            <Text>{state.balance}</Text>
            <Button isDisabled={!state.key} onClick={() => openModal(true)}>Send AR</Button>
        </SimpleGrid>
        {state.tokens?.map((token: tokenBalance) => {
            return (
                <SimpleGrid columns={3}>
                    <Text>{token.ticker}</Text>
                    <Text>{token.balance}</Text>
                    <Popover closeOnBlur={false}>
                        {({ onClose }) =>
                            <>
                                <PopoverTrigger>
                                    <Button >Send {token.ticker}</Button>
                                </PopoverTrigger>
                                <PopoverContent zIndex={4}>
                                    <PopoverArrow />
                                    <PopoverHeader>Send Tokens</PopoverHeader>
                                    <PopoverCloseButton />
                                    <PopoverBody>
                                        <Stack align="center">
                                            {!loading ?
                                                <Box>
                                                    <Input
                                                        w="90%"
                                                        placeholder={`Amount`}
                                                        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setAmount(parseFloat(evt.target.value)) }}
                                                    />
                                                    <Input
                                                        w="90%" placeholder={`Address`} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setTo(evt.target.value) }} />
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
                </SimpleGrid>
            )
        })
        }
        <TransferModal props={{ modal, closeModal }} />
        <Box position="fixed" bottom="10%">
            <AddToken />
        </Box>
    </Box>
    )
}

export default Tokens