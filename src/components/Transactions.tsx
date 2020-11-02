import React from 'react'
import axios from 'axios'
import { Box, Stack, Text } from '@chakra-ui/core'
import WalletContext from '../context/walletContext'

const Txn = (txn: any) => {
    return (
        <Stack isInline>
            <Text>ID: {txn.node.id}</Text>
            <Text>Owner: {txn.node.owner.address}</Text>
        </Stack>
    )
}
const Transactions = () => {
    const { state } = React.useContext(WalletContext)
    const [txns, setTxns] = React.useState([])
    console.log(state.address)
    React.useEffect(() => {
        axios.post('https://arweave.net/graphql', {
            query: `query {
                transactions(owners:  ["${state.address}"]) {
                  edges {
                    node {
                      id
                      owner {
                        address
                      }
                      recipient
                      tags {
                        name
                        value
                      }
                      fee {
                        winston
                        ar
                      }
                      quantity {
                        winston
                        ar
                      }
                    }
                  }
                }
              }`
        })
        .then((res) => {
            console.log(res.data)
            setTxns(res.data.data.transactions.edges)
        })
        .catch((err) => console.log(err))
    },[])
    return (<Box>
        {/* @ts-ignore */}
        {txns.length > 0 ? txns.map((txn) => Txn(txn)): null}</Box>
    )
}

export default Transactions