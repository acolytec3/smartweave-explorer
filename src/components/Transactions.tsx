import React from 'react'
import { Text, Accordion, AccordionItem, AccordionHeader, AccordionPanel, AccordionIcon, SimpleGrid, Box, Heading, } from '@chakra-ui/core'
import WalletContext from '../context/walletContext'
import { getTxns } from '../providers/wallets'

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
        <SimpleGrid columns={2}>
          <Text fontSize={10}>Fee: </Text>
          <Text fontSize={10}>{txn.node.fee.ar} AR</Text>
          {txn.node.recipient && <React.Fragment><Text fontSize={10}>Recipient: </Text>
            <Text fontSize={10}>{txn.node.recipient}</Text>
            <Text fontSize={10}>Amount: </Text>
            <Text fontSize={10}>{txn.node.quantity.ar} AR</Text></React.Fragment>}
        </SimpleGrid>
        <Heading size="xs">Transaction Tags</Heading>
        {txn.node.tags.map((tag: any) => {
          return (<SimpleGrid key={txn.node.id+tag.name} columns={2}>
            <Text fontSize={10} key={tag.toString()}>{tag.name}</Text>
            <Text fontSize={10} key={tag.name+tag.value}>{tag.value}</Text>
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

  React.useEffect(() => {
    if (state.address !== '') {
      getTxns(state.address)
    .then((txns) => { console.log(txns)
      setTxns(txns)})
    }
    else setTxns([])
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