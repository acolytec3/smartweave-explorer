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
  HStack,
  Input,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import WalletContext from "../context/walletContext";
import {
  getTxnData,
  getContractState
} from "../providers/wallets";
import {
  FunctionCallProps,
  testFunction,
  runFunction,
  getInputMethods
} from '../providers/smartweave';

const SmartweaveExplorer = () => {
  const [contractSource, setSource] = React.useState("");
  const [contractId, setID] = React.useState("");
  const [writeMethods, setWriteMethods] = React.useState(
    [] as FunctionCallProps[]
  );
  const [readMethods, setReadMethods] = React.useState(
    [] as FunctionCallProps[]
  );
  const [contractState, setContractState] = React.useState({} as any);

  const getSource = async () => {
      let source = await getTxnData(contractId);
      setSource(source);
      let methods = await getInputMethods(source);
      if (methods?.writeMethods) setWriteMethods(methods.writeMethods);
      if (methods?.readMethods) setReadMethods(methods.readMethods);
      let res = await getContractState(contractId);
      setContractState(res);
  }

  return (
    <VStack>
      <Input
        placeholder="Smartweave Contract ID"
        value={contractId}
        onChange={(evt) => setID(evt.target.value)}
      />
      <Button onClick={getSource}>Load Contract</Button>
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

export interface FunctionCallComponentProps {
  name: string;
  params: string[];
  methodType: string;
  contractId: string;
}

const FunctionCall: React.FC<FunctionCallComponentProps> = ({
  name,
  params,
  methodType,
  contractId,
}) => {
  const [values, setValue] = React.useState({} as any);
  const [types, setType] = React.useState({} as any);
  const { state } = React.useContext(WalletContext);
  const toast = useToast();
  const [txnStatus, setStatus] = React.useState() as any;
  const { isOpen, onToggle } = useDisclosure();

  const submitTransaction = async (close: () => void) => {
    let res = await runFunction(
      name,
      contractId,
      values,
      state.key,
      types,
      methodType
    );
    if (res)
      toast({
        title: "Successfully submitted transaction!",
        status: "success",
        duration: 3000,
        position: "bottom",
      });
    else
      toast({
        title: "Error submitting transaction",
        status: "error",
        duration: 3000,
        position: "bottom",
      });
    close();
    setStatus();
  };

  return (
    <Accordion allowToggle>
      <AccordionItem key={name}>
        <AccordionButton>
          <Text>{name}</Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          {params.map((param, index) => {
            return (
              <Box>
                <Input
                  key={name + param}
                  placeholder={param}
                  value={values[index]}
                  onChange={(evt) => {
                    let vals = { ...values };
                    vals[param] = evt.target.value;
                    setValue(vals);
                  }}
                />
                <RadioGroup
                  name="param-type"
                  onChange={(evt) => {
                    let newTypes = { ...types };
                    newTypes[param] = evt.toString();
                    setType(newTypes);
                  }}
                  value={types[param]}
                  direction="horizontal"
                >
                  <Radio value="string">String</Radio>
                  <Radio value="integer">Integer</Radio>
                  <Radio value="float">Float</Radio>
                </RadioGroup>
              </Box>
            );
          })}
          {methodType === "write" ? (
            <>
              {!isOpen && !txnStatus && (
                <Button
                  onClick={() => {
                    onToggle();
                    testFunction(
                      name,
                      contractId,
                      values,
                      state.key,
                      types
                    ).then((res) => setStatus(res));
                  }}
                >
                  Test Contract Method Call
                </Button>
              )}
            </>
          ) : (
            <>
              {!isOpen ? (
                <Button
                  onClick={() => {
                    onToggle();
                    runFunction(
                      name,
                      contractId,
                      values,
                      state.key,
                      types,
                      methodType
                    ).then((res) => setStatus(res));
                  }}
                >
                  Read Contract
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    onToggle();
                    setStatus();
                  }}
                >
                  Start Over
                </Button>
              )}
            </>
          )}
          <Collapse in={isOpen}>
            {methodType === "write" ? (
              <VStack>
                {txnStatus ? (
                  <Text>Transaction status is {txnStatus}</Text>
                ) : (
                  <Spinner />
                )}
                <HStack>
                  <Button onClick={() => submitTransaction(onToggle)}>
                    Live dangerously!
                  </Button>
                  <Button
                    onClick={() => {
                      onToggle();
                      setStatus();
                    }}
                  >
                    Start Over
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Code>
                <Text>Method Result</Text>
                {txnStatus ? (
                  <Textarea
                    isReadOnly
                    overflow="scroll"
                    height="200px"
                    readOnly={true}
                    fontSize="xs"
                    defaultValue={JSON.stringify(txnStatus, null, 2)}
                  />
                ) : (
                  <Spinner />
                )}
              </Code>
            )}
          </Collapse>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
