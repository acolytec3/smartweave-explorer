import React, { useState, useEffect, Fragment } from 'react';
import {
    Text, Button, Input, Stack,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast, InputRightElement, InputGroup, FormControl, FormErrorMessage, Modal
} from "@chakra-ui/react";
import { getFee, sendTransfer } from '../providers/wallets'

import WalletContext from '../context/walletContext'

const TransferModal = (props: any) => {
    const [isOpen, setOpen] = useState(props.props.modal)
    const { state } = React.useContext(WalletContext)
    const [amount, setAmount] = useState('')
    const [fee, setFee] = useState('0')
    const [to, setToAddress] = useState('')
    const [next, setNext] = useState(false)
    const [validAmount, setValid] = useState(true)
    const toast = useToast()


    const updateFee = () => {
        getFee(0).then(cost => setFee(cost))
            .catch(() => toast({
                title: 'Error',
                status: 'error',
                duration: 3000,
                position: 'bottom-left',
                description: 'Error getting fee, check your network connection and try again'
            }))
    }

    useEffect(() => {
        setOpen(props.props.modal)
        updateFee()
    }, [props.props.modal])

    const initiateTransfer = async () => {
        let transferDeets = {
            'to': to,
            'fee': fee,
            'txnId': '',
            'amount': amount,
        }
        sendTransfer(transferDeets, state.key)
        setOpen(false)
    }

    const validateAmount = () => {
        amount === '' ?
            setValid(true) :
            setValid(parseFloat((parseFloat(state.balance) - parseFloat(fee) - parseFloat(amount)).toFixed(12)) >= 0)
    }

    const setMax = async () => {
        let balance = parseFloat(state.balance)
        let amount = balance - parseFloat(fee)
        setAmount(amount.toString())
    }
    
    return (<Modal closeOnOverlayClick={false} isCentered isOpen={isOpen} onClose={() => {
        setOpen(false)
        props.props.closeModal()
    }}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Send AR</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Stack spacing={2}>
                    <Stack>
                        <Text>From:</Text>
                        <Text fontSize={14} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{state.address}</Text>
                    </Stack>
                    {!next && <Fragment>
                        <Stack spacing={2}>
                            <FormControl isInvalid={to === state.address}>
                                <Input placeholder="Send to Arweave wallet address"
                                    value={to}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToAddress(e.target.value)}
                                    onBlur={updateFee}
                                    isInvalid={to === state.address} />
                                <FormErrorMessage>Recipient address cannot be the same as the sending address</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!validAmount}>
                                <InputGroup>
                                    <Input
                                        placeholder="Amount"
                                        value={amount}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                                        onBlur={() => validateAmount()}
                                        isInvalid={!validAmount}
                                    />
                                    <InputRightElement children='AR' />
                                </InputGroup>
                                <FormErrorMessage>Amount cannot be greater than wallet balance</FormErrorMessage>
                            </FormControl>
                            <Button border="none" onClick={setMax}>Use Wallet Balance</Button>

                            <Text>Fee: {fee} AR</Text>
                            <Text>Total (including fee): {(parseFloat(fee) + parseFloat(amount ? amount : '0')).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: (fee !== '0') ? fee.split('.')[1].length : 1 })} AR</Text>
                        </Stack>
                    </Fragment>}
                    {next && <Fragment>
                        <Stack spacing={2}>
                            <Stack>
                                <Text>To:</Text>
                                <Text fontSize={14}>{to}</Text>
                            </Stack>
                            <Stack isInline>
                                <Stack>
                                    <Text>Sending</Text>
                                    <Text>{amount} AR</Text>
                                </Stack>
                                <Stack>
                                    <Text>Fee</Text>
                                    <Text>{fee} AR</Text>
                                </Stack>
                            </Stack>
                            <Stack>
                                <Text>Total</Text>
                                <Text>{(parseFloat(fee) + parseFloat(amount ? amount : '0')).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: (fee !== '0') ? fee.split('.')[1].length : 1 })} AR</Text>
                            </Stack>
                            <Stack>
                                <Text>Balance after transaction</Text>
                                <Text>{(parseFloat(state.balance) - parseFloat(fee) - parseFloat(amount)).toString()} AR</Text>
                            </Stack>
                        </Stack>
                    </Fragment>}
                </Stack>
            </ModalBody>
            <ModalFooter>
                {!next ? <Button bg="#333" color="white" w="100%" isDisabled={!validAmount || (to === '')} onClick={() => setNext(true)}>Next</Button> :
                    <Button bg="#333" color="white" w="100%" onClick={function () {
                        initiateTransfer();
                        setOpen(false)
                        props.props.closeModal();
                    }}>Confirm and Send AR</Button>}
            </ModalFooter>
        </ModalContent>
    </Modal>
    )
}

export default TransferModal