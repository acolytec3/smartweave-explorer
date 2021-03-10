import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Code,
  Collapse,
  Heading,
  Input,
  List,
  ListItem,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { FunctionCallProps, getInputMethods } from "../providers/smartweave";
import {
  getAllCommunityIds,
  getContractState,
  getTxnData,
} from "../providers/wallets";
import FunctionCall from "./FunctionCall";

const SmartweaveExplorer = () => {
  const { isOpen, onToggle } = useDisclosure()

  const [contractSource, setSource] = React.useState("");
  const [displayId, setDisplayId] = React.useState('')
  const [contractId, setID] = React.useState("");
  const [writeMethods, setWriteMethods] = React.useState(
    [] as FunctionCallProps[]
  );
  const [readMethods, setReadMethods] = React.useState(
    [] as FunctionCallProps[]
  );
  const [contractState, setContractState] = React.useState({} as any);
  const [contractIds, setIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    getAllCommunityIds().then((ids) => setIds(ids));
  }, []);

  React.useEffect(() => {
    if (contractId){
      getSource();
    }
  }, [contractId]);

  const getSource = async () => {
    if (!contractId) {
      console.log('no contract ID!')
      return;
    }
    let source = await getTxnData(contractId);
    setSource(source);
    let methods = await getInputMethods(source);
    if (methods?.writeMethods) setWriteMethods(methods.writeMethods);
    if (methods?.readMethods) setReadMethods(methods.readMethods);
    let res = await getContractState(contractId);
    setContractState(res);
  };

  return (
    <VStack>

      <Button onClick={onToggle}>
          <Box flex="1" textAlign="left">
         PSC Contract Addresses
        </Box>
        </Button>
        <Collapse in={isOpen} animateOpacity>  
        <List>
          {contractIds.map((id) => {
            return (
              <ListItem
                onClick={() => {
                  setID(id);
                  setDisplayId(id);
                  onToggle();
                }}
                cursor="pointer"
              >
                {id}
              </ListItem>
            );
          })}
        </List>
        </Collapse>
      <Input
        placeholder="Smartweave Contract ID"
        value={displayId}
        onChange={(evt) => setDisplayId(evt.target.value)}
      />
      <Button onClick={() => setID(displayId)}>Load Contract</Button>
      <Heading size="xs">Contract Source</Heading>
      <Code w="100%">
        <Textarea
          overflow="scroll"
          height="200px"
          readOnly={true}
          fontSize="xs"
          isReadOnly
          defaultValue={contractSource}
        />
      </Code>
      <Heading size="xs">Contract State</Heading>
      <Code
        w="100%"
        overflow="scroll"
        height="200px"
        fontSize="xs"
        align="start"
      >
        {JSON.stringify(contractState, null, 2)}
      </Code>

      <Heading size="xs">Write Methods</Heading>
      <List>
        {writeMethods &&
          writeMethods.map((method: FunctionCallProps) => (
            <ListItem>
              <FunctionCall
                name={method.name}
                params={method.params}
                methodType={method.methodType}
                contractId={contractId}
              />
            </ListItem>
          ))}
      </List>
      <Heading size="xs">Read Methods</Heading>
      <List>
        {readMethods &&
          readMethods.map((method: FunctionCallProps) => (
            <ListItem>
              <FunctionCall
                name={method.name}
                params={method.params}
                methodType={method.methodType}
                contractId={contractId}
              />
            </ListItem>
          ))}
      </List>
    </VStack>
  );
};

export default SmartweaveExplorer;
