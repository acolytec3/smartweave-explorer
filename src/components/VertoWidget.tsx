import { Box, Button, Center, Divider, Heading, HStack, Input, Spinner, Text, VStack } from "@chakra-ui/core";
import React from 'react';
import WalletContext from '../context/walletContext';
import { getOpenBuyDeets, getOpenSellDeets, trade } from '../providers/verto';

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

    React.useEffect(() => {
        setLoading(true)
        const getTrades = async () => {
            let buy = await getOpenBuyDeets(contractID, state.key)
            let sell = await getOpenSellDeets(contractID, state.key)
            await setTrades({ buy: buy, sell: sell })
            setLoading(false)
            let txns = await trade("Buy", Math.floor(parseFloat(state.balance)), state.key, contractID);
            setMax(txns.ar)
        }
        getTrades()
    }, [])

    const handleBuy = async () => {
        if (convertedAmount === 0) {
            await calculateAr();
        }
        let res = await trade("Buy", convertedAmount, state.key, contractID)
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

    const handleSell = async () => {
        if (sellConvertedAmount === 0) {
            await calcSalePrice()
        }
        let res = await trade("Sell", parseInt(sellAmount), state.key, contractID)
    }

    const calcSalePrice = async () => {
        let amount = parseInt(sellAmount)
        if (!amount) {
            setSellConversion(0)
            return
        }
        let ar = 0
        trades.sell.rates.every((rate: {amount:number, rate: number}) => {
            if (amount > rate.amount) {
                ar+= rate.amount * rate.rate;
                amount -= rate.amount
                return true
            }
            else {
                ar+= amount * rate.rate;
                return false
            }
        })
        setSellConversion(ar)
    }
    
    return (
        <VStack align="center">
            {loading && <Spinner />}
            {!loading && <Box>
                <Heading size="sm">Buy/Sell {ticker}</Heading>
                <Divider />
                {trades.buy && trades.buy.volume > 0 ? <>
                    <Text>Average Buy Price: {trades.buy.averageRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {ticker}/AR</Text>
                    <Text>Total Available {ticker}: {trades.buy.volume}</Text>
                    <Text>Total AR you can spend: {maxBuy}</Text>
                    <HStack>
                        <Input placeholder="Enter amount" value={purchaseAmount}
                            onChange={((evt: React.ChangeEvent<HTMLInputElement>) => setAmount(evt.target.value))}
                            onBlur={calculateAr} />
                        <Text>Cost in AR: {convertedAmount}</Text>
                        <Button onClick={handleBuy}>Buy</Button>
                    </HStack>
                </>
                    :
                    <Text>No open buy orders</Text>}
                {trades.sell && trades.sell.volume > 0 ? <>
                    <Text>Average Sell Price: {trades.sell.averageRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {ticker}/AR</Text>
                    <Text>Total of open orders: {trades.sell.volume} {ticker}</Text>
                    <HStack>
                        <Input placeholder="Enter amount" value={sellAmount}
                            invalid={parseInt(sellAmount) > parseInt(balance) }
                            onChange={((evt: React.ChangeEvent<HTMLInputElement>) => setSell(evt.target.value))}
                            onBlur={calcSalePrice}
                            />
                        <Text>Amount in AR: {sellConvertedAmount}</Text>
                        <Button disabled={parseInt(sellAmount) > parseInt(balance) || parseInt(sellAmount) <=0 } onClick={handleSell}>Sell</Button>
                    </HStack>
                    </>
                    : <Text>No open sell orders</Text>}
            </Box>}
        </VStack>
    )
}

export default VertoWidget