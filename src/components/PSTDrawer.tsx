
import React from 'react'
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton, Button,
    HStack,
    Stack,
    Text,
    Avatar,
    AccordionButton,
    Accordion,
    AccordionIcon,
    AccordionPanel,
    AccordionItem,
    SimpleGrid
} from "@chakra-ui/core";
import VertoWidget from './VertoWidget'
import WalletContext from '../context/walletContext'
import { timeLeft } from '../providers/wallets'

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

    React.useEffect(() => {
        let totalBalance = 0
        for (const [key, value] of Object.entries(balances.balances)) {
            totalBalance += value as number
        }
        setTotal(totalBalance)
    }, [balances])

    return (
        <Accordion allowToggle w="100%">
            <AccordionItem>
                <AccordionButton bg="white" border="1px" borderColor="grey">
                    <Text>All balances - {total} in circulation</Text>
                    <AccordionIcon />
                </AccordionButton>
                <AccordionPanel border="1px">
                    {Object.entries(balances.balances).map((balance: any[]) => {
                        return (<HStack w="100%" key={balance[0] + 1}>
                            <Text key={balance[0]} maxWidth="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{balance[0]}:</Text>
                            <Text key={balance[0] + balance[0]}>{balance[1].toString()}</Text>
                        </HStack>)
                    })
                    }
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    )
}

const PSTVault: React.FC<VaultProps> = ({ vault }) => {
    const [total, setTotal] = React.useState(0)

    React.useEffect(() => {
        let totalBalance = 0
        for (const [key, value] of Object.entries(vault)) {
            if (value[0]) totalBalance += value[0].balance
        }
        setTotal(totalBalance)
    }, [vault])
    
    return (
        <Accordion allowToggle w="100%">
            <AccordionItem>
                <AccordionButton bg="white" border="1px" borderColor="grey">
                    <Text>Vaulted balances: {total}</Text>
                    <AccordionIcon />
                </AccordionButton>
                <AccordionPanel border="1px">

                    {Object.keys(vault).map((key) => {
                        if (vault[key].length > 0)
                            return vault[key].map((balance: any, index: number) => {
                                return (<SimpleGrid w="100%" col={3} key={key + index} fontSize={12}>
                                    <Text key={key} maxWidth="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{key}:</Text>
                                    <Text key={balance.toString()}>{balance.balance}</Text>
                                    <Text key={balance.start + balance.end + key}>{balance.end}</Text>
                                </SimpleGrid>)
                            })
                    })
                    }
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    )
}
const PSTDrawer: React.FC<PSTDrawerProps> = ({ isOpen, close, contractState }) => {
    const { state } = React.useContext(WalletContext)
    const [vaultTime, setVault] = React.useState([] as any[])
    
    React.useEffect(() => {
        console.log(contractState)
        const getVaultTimes = async (vault: any) => {
            let vaultTimes = await Promise.all(vault[state.address].map(async (balance: any) => {
                let endBlock = balance?.end
                if (endBlock) {
                    let message = await timeLeft(state.blockHeight ? state.blockHeight : 0, endBlock)
                    return { balance: balance.balance, message: message }
                }
            }))
            setVault(vaultTimes)
        }
        if (contractState.vault && contractState.vault[state.address]) {
            getVaultTimes(contractState.vault)
        }
    }, [contractState])

    return (<>
        {contractState.balances && <Drawer isOpen={isOpen} placement="right" onClose={close} size="full">
            <DrawerOverlay />
            <DrawerContent >
                <DrawerCloseButton onClick={close} />
                <DrawerHeader >
                    <HStack>
                        <Text>{contractState.ticker}</Text>
                        <Avatar src={'https://arweave.net/' + contractState.settings.filter((setting: any) => setting[0] === 'communityLogo')[0][1]} />
                    </HStack>
                </DrawerHeader>
                <DrawerBody>
                    <Stack>
                        <Text>Balance: {contractState.balances[state.address]}</Text>
                        <VertoWidget contractID={contractState.contractID} ticker={contractState.ticker} balance={contractState.balances[state.address]}/>
                        {
                            vaultTime.map((vault: { balance: string, message: string }, index: number) => {
                                return (<HStack>
                                    <Text key={index+vault.toString()}>Vaulted Balance: {vault.balance}</Text>
                                    <Text key={index+vault.message}>{vault.message}</Text>
                                </HStack>)
                            })
                        }
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
