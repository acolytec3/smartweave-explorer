import React from 'react'
import axios from 'axios'
import { Text, Accordion, AccordionItem, AccordionHeader, AccordionPanel, AccordionIcon, SimpleGrid, Box, Heading, } from '@chakra-ui/core'
import WalletContext from '../context/walletContext'

const Txn = (txn: any) => {
  return (
    <AccordionItem>
      <AccordionHeader bg="white" border="1px" borderColor="grey">
      <Box flex="1" textAlign="left">
      ID: {txn.node.id}
      </Box>

        <AccordionIcon />
      </AccordionHeader>

      <AccordionPanel border="1px">
        {txn.node.tags.map((tag: any) => {
          return (<SimpleGrid columns={2}>
            <Text fontSize={10}>{tag.name}</Text>
            <Text fontSize={10}>{tag.value}</Text>
          </SimpleGrid>
          )
        })}
      </AccordionPanel>
    </AccordionItem>

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
  }, [state.address])

  return (<Box>
    <Accordion allowToggle allowMultiple w="100%">
      {/* @ts-ignore */}
      {txns.length > 0 ? txns.map((txn) => Txn(txn)) : null}
    </Accordion>
  </Box>
  )
}

export default Transactions