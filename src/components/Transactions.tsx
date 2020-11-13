import React from 'react'
import { Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, SimpleGrid, Box, Heading, Button, Input, Stack, Spinner, IconButton, PopoverTrigger, Popover, PopoverContent, } from '@chakra-ui/core'
import WalletContext from '../context/walletContext'
import { getTxns } from '../providers/wallets'
import { FaSearch } from 'react-icons/fa'

const Txn = (txn: any) => {
  return (
    <AccordionItem key={txn.id} textAlign="left">
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
  const [loading, setLoading] = React.useState(false)
  const [txns, setTxns] = React.useState([])
  const [name, setName] = React.useState('')
  const [value, setValue] = React.useState('')

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

  const retrieveTransactions = async () => {
    setLoading(true)
    let txns = await getTxns(state.address, name, value)
    setTxns(txns)
    setLoading(false)
  }

  return (<Box h="100%">
    {!loading ? <><Accordion allowToggle allowMultiple w="100%">
      {/* @ts-ignore */}
      {txns.length > 0 ? txns.map((txn) => Txn(txn)) : null}
    </Accordion>
      <Popover>
        <PopoverTrigger>
          <IconButton position="fixed" bottom="6%" left="5%" aria-label="search transactions" icon={<FaSearch />} />
        </PopoverTrigger>
        <PopoverContent>
          <Stack>
            <Input placeholder="Name" value={name} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setName(evt.target.value)} />
            <Input placeholder="Value" value={value} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setValue(evt.target.value)} />
            <Button isDisabled={(name === '' || value === '')}
              onClick={() => {
                retrieveTransactions()
                setName('')
                setValue('')
              }}>
              Search by Tag</Button>
          </Stack>
        </PopoverContent>
      </Popover>
    </>
      :
      <Spinner position="fixed" bottom="50%" right="50%" />}
  </Box>
  )
}

export default Transactions