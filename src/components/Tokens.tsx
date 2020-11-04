import React from 'react'
import WalletContext, { tokenBalance } from '../context/walletContext'
import { Box, Button, Heading, SimpleGrid, Text, Popover, PopoverTrigger, Input, PopoverArrow, PopoverBody, PopoverContent, PopoverCloseButton, PopoverHeader, useToast, PseudoBox, Spinner, Stack } from '@chakra-ui/core'
import TransferModal from './TransactionModal'
import { sendTokens, getFee } from '../providers/wallets'

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
            <Text borderBottom="1px" fontWeight="bold">Ticker</Text>
            <Text borderBottom="1px" fontWeight="bold">Balance</Text>
            <span></span>
            <Text>AR</Text>
            <Text>{state.balance}</Text>
            <Button onClick={() => openModal(true)}>Send AR</Button>
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
                                                <Box><Input w="90%" placeholder={`Amount`} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setAmount(parseFloat(evt.target.value)) }} />
                                                    <Input w="90%" placeholder={`Address`} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => { setTo(evt.target.value) }} />
                                                    <Text textAlign="center">Fee: {fee}</Text>
                                                    <Button w="90%"onClick={() => {
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
    </Box>
    )
}

export default Tokens