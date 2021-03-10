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
  HStack,
  Input,
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
import { runFunction, testFunction } from "../providers/smartweave";

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

export default FunctionCall;
