import React from 'react'
import { Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, SimpleGrid, Box, Heading, } from '@chakra-ui/core'
import WalletContext from '../context/walletContext'
import { getTxns } from '../providers/wallets'

const Txn = (txn: any) => {
  return (
    <AccordionItem textAlign="left">
      <AccordionButton bg="white" border="1px" borderColor="grey">
          <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">ID: {txn.node.id}</Text>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel border="1px">
      <Heading size="xs" fontSize="12px">Metadata</Heading>
        <SimpleGrid columns={2}>
          <Text fontSize={10}>Fee: </Text>
          <Text fontSize={10}>{txn.node.fee.ar} AR</Text>
          {txn.node.recipient && <React.Fragment><Text fontSize={10}>Recipient: </Text>
            <Text fontSize={10}>{txn.node.recipient}</Text>
            <Text fontSize={10}>Amount: </Text>
            <Text fontSize={10}>{txn.node.quantity.ar} AR</Text></React.Fragment>}
        </SimpleGrid>
        <Heading size="xs" fontSize="12px">Transaction Tags</Heading>
        {txn.node.tags.map((tag: any) => {
          return (<SimpleGrid key={txn.node.id + tag.name} columns={2} textAlign="left" overflow="auto">
            <Text fontSize={10} key={tag.toString()}>{tag.name}</Text>
            <Text fontSize={10} key={tag.name + tag.value}>{tag.value}</Text>
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
        .then((txns) => {
          console.log(txns)
          setTxns(txns)
        })
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