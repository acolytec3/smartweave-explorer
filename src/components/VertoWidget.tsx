import { Box, Center, Divider, Heading, Spinner, Text, VStack } from "@chakra-ui/core";
import React from 'react';
import WalletContext from '../context/walletContext';
import { getOpenBuyDeets, getOpenSellDeets } from '../providers/verto';

interface VertoProps {
    contractID: string,
    ticker: string
}

const VertoWidget: React.FC<VertoProps> = ({ contractID, ticker }) => {
    const [loading, setLoading] = React.useState(false)
    const [trades, setTrades] = React.useState({} as any)
    const { state } = React.useContext(WalletContext)

    React.useEffect(() => {
        setLoading(true)
        const getTrades = async () => {
            let buy = await getOpenBuyDeets(contractID, state.key)
            let sell = await getOpenSellDeets(contractID, state.key)
            await setTrades({ buy: buy, sell: sell })
            setLoading(false)
        }
        getTrades()
    }, [])
    return (
        <VStack align="center">
            {loading && <Spinner />}
            {!loading && <Box>
                <Heading size="sm">Buy/Sell {ticker}</Heading>
                <Divider />
                {trades.buy && trades.buy.volume > 0 ? <><Text>Average Buy Price: {trades.buy.averageRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {ticker}/AR</Text>
                    <Text>Total available supply: {trades.buy.volume} {ticker}</Text></> : <Text>No traders are currently buying</Text>}
                {trades.sell && trades.sell.volume > 0 ? <><Text>Average Sell Price: {trades.sell.averageRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {ticker}/AR</Text>
                    <Text>Total of open orders: {trades.sell.volume} {ticker}</Text> </> : <Text>No traders are currently selling</Text>}
            </Box>}
        </VStack>
    )
}

export default VertoWidget