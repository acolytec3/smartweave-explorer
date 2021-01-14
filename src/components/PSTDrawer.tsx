
import {
    Avatar, Box, Button, Collapse, Drawer,
    DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Heading, HStack,
    Stack, Text, useDisclosure
} from "@chakra-ui/react";
import React from 'react';
import WalletContext from '../context/walletContext';
import { timeLeft } from '../providers/wallets';
import VertoWidget from './VertoWidget';

interface PSTDrawerProps {
    isOpen: boolean,
    close: () => void,
    contractState: any
}

interface VaultProps {
    vault: {
        [address: string]: any
    }
}

const PSTBalances = (balances: any) => {
    const [total, setTotal] = React.useState(0)
    const [open, setOpen] = React.useState(false)
    React.useEffect(() => {
        let mounted = true
        let totalBalance = 0
        for (const [key, value] of Object.entries(balances.balances)) {
            totalBalance += value as number
        }
        if (mounted) setTotal(totalBalance)
        return () => { mounted = false }
    }, [balances])

    return (
        <Box w='100%'>
            <Box bg="white" border="1px" borderColor="grey" onClick={() => setOpen(!open)}><Text>All balances - {total} in circulation</Text></Box>
            <Collapse in={open}>
                {Object.entries(balances.balances).map((balance: any[]) => {
                    return (<HStack w="100%" key={balance[0] + 1}>
                        <Text key={balance[0]} maxWidth="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{balance[0]}:</Text>
                        <Text key={balance[0] + balance[0]}>{balance[1].toString()}</Text>
                    </HStack>)
                })
                }
            </Collapse>
        </Box>
    )
}

const PSTVault: React.FC<VaultProps> = ({ vault }) => {
    const [total, setTotal] = React.useState(0)
    const { isOpen, onToggle } = useDisclosure()

    React.useEffect(() => {
        let mounted = true
        let totalBalance = 0
        for (const [key, value] of Object.entries(vault)) {
            if (value[0]) totalBalance += value[0].balance
        }
        if (mounted) setTotal(totalBalance)
        return () => { mounted = false }
    }, [vault])

    return (
        <Box w='100%'>
            <Box bg="white" border="1px" borderColor="grey" onClick={onToggle}><Text>Vaulted balances: {total}</Text></Box>
            <Collapse in={isOpen}>
                {Object.keys(vault).map((key) => {
                    if (vault[key].length > 0)
                        return vault[key].map((balance: any, index: number) => {
                            return (<Box key={key + index} fontSize={12}>
                                <Text key={key} maxWidth="100%" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">Address: {key}</Text>
                                <HStack><Text key={balance.toString()}>Balance: {balance.balance}</Text>
                                    <Text key={balance.start + balance.end + key}>End Block: {balance.end}</Text></HStack>
                            </Box>)
                        })
                    return null
                })
                }
            </Collapse>
        </Box>
    )
}
const PSTDrawer: React.FC<PSTDrawerProps> = ({ isOpen, close, contractState }) => {
    const { state } = React.useContext(WalletContext)
    const [vaultTime, setVault] = React.useState([] as any[])
    const [logo, setLogo] = React.useState('')

    React.useEffect(() => {
        let mounted = true
        console.log(contractState)
        const getVaultTimes = async (vault: any) => {
            if (!mounted) return
            let vaultTimes = await Promise.all(vault[state.address].map(async (balance: any) => {
                let endBlock = balance?.end
                if (endBlock) {
                    let message = await timeLeft(state.blockHeight ? state.blockHeight : 0, endBlock)
                    return { balance: balance.balance, message: message }
                }
            }))
            if (mounted) setVault(vaultTimes)
        }
        if (contractState.vault && contractState.vault[state.address]) {
            getVaultTimes(contractState.vault)
        }
        return () => { mounted = false }
    }, [contractState])

    React.useEffect(() => {
        let url
        try {
            if (contractState.settings)
                url = contractState.settings.filter((setting: any) => setting[0] === 'communityLogo')[0][1]
            setLogo(url)
        }
        catch (err) {
            console.log('error loading logo')
            console.log(err)
        }

        if (url) setLogo(url)
        return () => { setLogo('') }
    }, [contractState])

    return (<>
        {contractState.balances && <Drawer isOpen={isOpen} placement="right" onClose={close} size="full">
            <DrawerOverlay />
            <DrawerContent >
                <DrawerCloseButton onClick={close} />
                <DrawerHeader >
                    {contractState.name && <Heading size="md">{contractState.name}</Heading>}
                    <HStack>
                        <Text>{contractState.ticker}</Text>
                        {logo !== '' && <Avatar src={`https://arweave.net/${logo}`} />}
                    </HStack>
                </DrawerHeader>
                <DrawerBody>
                    <Stack>
                        <Text>Balance: {contractState.balances[state.address] ? contractState.balances[state.address] : 0}</Text>
                        {
                            vaultTime.map((vault: { balance: string, message: string }, index: number) => {
                                return (<HStack>
                                    <Text key={index + vault.toString()}>Vaulted Balance: {vault.balance}</Text>
                                    <Text key={index + vault.message}>{vault.message}</Text>
                                </HStack>)
                            })
                        }
                        <VertoWidget contractID={contractState.contractID} ticker={contractState.ticker} balance={contractState.balances[state.address]} />
                    </Stack>
                    {contractState.balances && <PSTBalances balances={contractState.balances} />}
                    {contractState.vault && <PSTVault vault={contractState.vault} />}
                </DrawerBody>
                {/* margin is a hack to get buttons to show on mobile browsers */}
                <DrawerFooter mb={{ base: "25%", sm: "25%", md: "25%", lg: 0, xl: 0 }}>
                    <Button variant="outline" onClick={close} mr={3}>Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>}
    </>)
}

export default PSTDrawer
