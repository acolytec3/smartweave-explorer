import {
    Box, Button, Center, Divider, Heading, HStack, Input,
    Popover, PopoverArrow, PopoverBody,
    PopoverCloseButton, PopoverContent,
    PopoverHeader, PopoverTrigger, Spinner, Text, VStack
} from "@chakra-ui/core";
import React from 'react';
import WalletContext from '../context/walletContext';
import { createTrade, executeTrade, getOpenBuyDeets, getOpenSellDeets } from '../providers/verto';

interface VertoProps {
    contractID: string,
    ticker: string,
    balance: string
}

const VertoWidget: React.FC<VertoProps> = ({ contractID, ticker, balance }) => {
    const [loading, setLoading] = React.useState(false)
    const [trades, setTrades] = React.useState({} as any)
    const [purchaseAmount, setAmount] = React.useState('')
    const [convertedAmount, setConversion] = React.useState(0)
    const [maxBuy, setMax] = React.useState(0)
    const { state } = React.useContext(WalletContext)
    const [sellAmount, setSell] = React.useState('')
    const [sellConvertedAmount, setSellConversion] = React.useState(0)
    const [txns, setTxns] = React.useState({} as any)

    React.useEffect(() => {
        setLoading(true)
        let mounted = true
        const getTrades = async () => {
            let buy = await getOpenBuyDeets(contractID, state.key)
            let sell = await getOpenSellDeets(contractID, state.key)
            if (mounted) await setTrades({ buy: buy, sell: sell })
            if (mounted) {
                setLoading(false)
                let txns = await createTrade("Buy", Math.floor(parseFloat(state.balance)), state.key, contractID);
                if (mounted) setMax(txns.ar)
            }

        }
        getTrades()
        return () => {
            mounted = false
        }
    }, [])

    const createBuy = async () => {
        if (convertedAmount === 0) {
            await calculateAr();
        }
        let res = await createTrade("Buy", convertedAmount, state.key, contractID)
        await setTxns(res)
        setAmount('')
        console.log(txns)
    }

    const calculateAr = async () => {
        let amount = parseInt(purchaseAmount)
        if (!amount) {
            setConversion(0)
            return
        }
        else {
            let ar = 0
            for (let j = 0; j < trades.buy.rates.length; j++) {
                if (trades.buy.rates[j].amount < amount) {
                    ar += trades.buy.rates[j].amount * trades.buy.rates[j].rate
                    amount -= trades.buy.rates[j].amount
                }
                else {
                    ar += trades.buy.rates[j].rate * amount
                    break;
                }
            }
            setConversion(ar)
        }
    }

    const handleOrder = async () => {
        let res = await executeTrade(txns.txs, state.key)
        setTxns({})
        console.log(res)
    }

    const createSell = async () => {
        if (sellConvertedAmount === 0) {
            await calcSalePrice()
        }
        let res = await createTrade("Sell", parseInt(sellAmount), state.key, contractID)
        await setTxns(res)
        console.log(txns)
        setSell('')
    }

    const calcSalePrice = async () => {
        let amount = parseInt(sellAmount)
        if (!amount) {
            setSellConversion(0)
            return
        }
        let ar = 0
        trades.sell.rates.every((rate: { amount: number, rate: number }) => {
            if (amount > rate.amount) {
                ar += rate.amount * rate.rate;
                amount -= rate.amount
                return true
            }
            else {
                ar += amount * rate.rate;
                return false
            }
        })
        setSellConversion(ar)
    }

    return (
        <VStack align="center">
            <Heading size="sm">Verto Exchange</Heading>
            {loading && <Center h="100px"><Spinner /></Center>}
            {!loading && <Box>
                <Heading size="sm">Buy {ticker}</Heading>
                <Divider />
                {trades.buy && trades.buy.volume > 0 ? <>
                    <Text>Average Buy Price: {trades.buy.averageRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {ticker}/AR</Text>
                    <Text>Total Available {ticker}: {trades.buy.volume}</Text>
                    <Text>Total AR you can spend: {maxBuy}</Text>
                    <HStack>
                        <Input placeholder="Enter amount" w="50%" value={purchaseAmount}
                            onChange={((evt: React.ChangeEvent<HTMLInputElement>) => setAmount(evt.target.value))}
                            onBlur={calculateAr} />
                        <Text>Cost in AR: {convertedAmount}</Text>
                        <Popover closeOnBlur={false}>
                            {({ onClose }) =>
                                <>
                                    <PopoverTrigger><Button disabled={!purchaseAmount || parseInt(purchaseAmount) <= 0 || parseInt(purchaseAmount) === NaN} onClick={createBuy}>Buy</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>Order Confirmation</PopoverHeader>
                                        <PopoverBody>
                                            <VStack>
                                                <Text>Transaction Cost: {txns.ar}</Text>
                                                <Text>{ticker} received: {purchaseAmount}</Text>
                                                <Text>Wallet balance after transaction: {parseFloat(state.balance) - txns.ar}</Text>
                                                <Button onClick={() => { handleOrder(); onClose() }}>Submit Order</Button>
                                            </VStack>
                                        </PopoverBody>
                                    </PopoverContent>
                                </>}
                        </Popover>
                    </HStack>
                </>
                    :
                    <Text>No open buy orders</Text>}
                <Heading size="sm">Sell {ticker}</Heading>
                <Divider />
                {trades.sell && trades.sell.volume > 0 ? <>

                    <Text>Average Sell Price: {trades.sell.averageRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {ticker}/AR</Text>
                    <Text>Total of open orders: {trades.sell.volume} {ticker}</Text>
                    <HStack>
                        <Input placeholder="Enter amount" value={sellAmount}
                            invalid={parseInt(sellAmount) > parseInt(balance)}
                            onChange={((evt: React.ChangeEvent<HTMLInputElement>) => setSell(evt.target.value))}
                            onBlur={calcSalePrice}
                        />
                        <Text>Amount in AR: {sellConvertedAmount}</Text>
                        <Popover closeOnBlur={false}>
                            {({ onClose }) =>
                                <>
                                    <PopoverTrigger><Button disabled={parseInt(sellAmount) > parseInt(balance) || parseInt(sellAmount) <= 0} onClick={createSell}>Sell</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>Order Confirmation</PopoverHeader>
                                        <PopoverBody>
                                            <VStack>
                                                <Text>Transaction Cost: {txns.pst} {ticker}</Text>
                                                <Text>AR received: {sellConvertedAmount}</Text>
                                                <Text>Wallet balance after transaction: {parseFloat(state.balance) + sellConvertedAmount}</Text>
                                                <Button onClick={() => { handleOrder(); onClose() }}>Submit Order</Button>
                                            </VStack>
                                        </PopoverBody>
                                    </PopoverContent>
                                </>}
                        </Popover>
                    </HStack>
                </>
                    : <Text>No open sell orders</Text>}
            </Box>}
        </VStack>
    )
}

export default VertoWidget