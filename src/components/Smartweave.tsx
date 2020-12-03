import React from 'react'
import { Button, Input, Code, List, ListItem, Textarea, VStack, Accordion, AccordionButton, useToast, AccordionItem, AccordionPanel, Text, Box, RadioGroup, Radio, PopoverTrigger, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, Spinner, PopoverContent, Heading, Collapse, useDisclosure, AccordionIcon, HStack } from '@chakra-ui/core';
import { getContractState, getTxnData, runFunction, testFunction } from '../providers/wallets'
import WalletContext from '../context/walletContext'
import { write } from 'fs';
const acorn = require("acorn")
const walk = require("acorn-walk")
interface FunctionCallProps {
    name: string,
    params: string[],
    methodType: string,
    contractId: string
}

const SmartweaveExplorer = () => {
    const [contractSource, setSource] = React.useState('')
    const [contractId, setID] = React.useState('')
    const [writeMethods, setWriteMethods] = React.useState([] as FunctionCallProps[])
    const [readMethods, setReadMethods] = React.useState([] as FunctionCallProps[])
    const [contractState, setState] = React.useState({} as any)


    const getSource = async () => {
        let res = await getTxnData(contractId)
        setSource(res)
        if (res) {
            setSource(res)
            let src = await acorn.parse(res, { ecmaVersion: "latest", sourceType: "module" })
            if (src.body[0].declaration.id.name === 'handle') {
                let allMethods = src.body[0].declaration.body.body.filter((node: any) => node.type === "IfStatement" && node.test.left.object.name === "input")
                let methods = getInputMethods(allMethods)
                setWriteMethods(methods.writeMethods.filter((method) => method.name))
                setReadMethods(methods.readMethods.filter((method) => method.name))
                console.log(methods)
            }
            res = await getContractState(contractId)
            console.log(res)
            setState(JSON.stringify(res,null,2))
        }

    }

    const getInputMethods = (src: any[]): { readMethods: FunctionCallProps[], writeMethods: FunctionCallProps[] } => {
        let readMethods: FunctionCallProps[] = []
        let writeMethods: FunctionCallProps[] = []
        src.forEach((node) => {
            if (node.test.type === "BinaryExpression" && node.test.left.object && node.test.left.object.name === "input") {
                console.log(node)
                try {
                    let returnStatement = node.consequent.body[node.consequent.body.length - 1]     //Get write methods
                    if (returnStatement.type === 'ReturnStatement' && returnStatement.argument.properties[0].key.name === 'state') {
                        let params = node.consequent.body.filter((param: any) => param.type == "VariableDeclaration" && param.declarations[0].init.object && param.declarations[0].init.object.name === "input")
                        let paramNames = params.map((param: any) => param.declarations[0].id.name)
                        let name = node.test.right.value
                        writeMethods.push({
                            name: name,
                            params: paramNames,
                            methodType: 'write',
                            contractId: contractId
                        })
                    }
                    else {
                        console.log('found read method')
                        console.log(node.consequent.body[0])            //Get read methods
                        let params = node.consequent.body.filter((param: any) => param.type === "VariableDeclaration" && (
                            (param.declarations[0].init.left && param.declarations[0].init.left.object && param.declarations[0].init.left.object.name === "input") ||
                            (param.declarations[0].init.object && param.declarations[0].init.object.name === "input")))
                        let paramNames = params.map((param: any) => param.declarations[0].id.name)
                        let name = node.test.right.value
                        readMethods.push({
                            name: name,
                            params: paramNames,
                            methodType: 'read',
                            contractId: contractId
                        })
                    }
                }
                catch (err) { console.log(err) }
            }
        }
        );
        return { readMethods, writeMethods };
    }

    return (<VStack>
        <Input placeholder="Smartweave Contract ID" value={contractId} onChange={(evt) => setID(evt.target.value)} />
        <Button onClick={getSource}>Load Contract</Button>
        <Heading size="xs">Contract Source</Heading>
        <Code w="100%">
            <Textarea overflow="scroll" height="200px" readOnly={true} fontSize='xs' isReadOnly defaultValue={contractSource} />
        </Code>
        <Heading size="xs">Contract State</Heading>
        <Code w="100%">
            <Textarea overflow="scroll" height="200px" readOnly={true} fontSize='xs' isReadOnly defaultValue={contractState} />
        </Code>
        <Heading size="xs">Write Methods</Heading>
        <List>
            {writeMethods && writeMethods.map((method: FunctionCallProps) => <ListItem>
                <FunctionCall name={method.name} params={method.params} methodType={method.methodType} contractId={contractId} />
            </ListItem>)}
        </List>
        <Heading size="xs">Read Methods</Heading>
        <List>
            {readMethods && readMethods.map((method: FunctionCallProps) => <ListItem>
                <FunctionCall name={method.name} params={method.params} methodType={method.methodType} contractId={contractId} />
            </ListItem>)}
        </List>
    </VStack>
    )
}

export default SmartweaveExplorer

const FunctionCall: React.FC<FunctionCallProps> = ({ name, params, methodType, contractId }) => {
    const [values, setValue] = React.useState({} as any)
    const [types, setType] = React.useState({} as any)
    const { state } = React.useContext(WalletContext)
    const toast = useToast();
    const [txnStatus, setStatus] = React.useState() as any
    const { isOpen, onToggle } = useDisclosure()

    const submitTransaction = async (close: () => void) => {
        let res = await runFunction(name, contractId, values, state.key, types, methodType)
        if (res)
            toast({
                title: 'Successfully submitted transaction!',
                status: 'success',
                duration: 3000,
                position: 'bottom',
            })
        else toast({
            title: 'Error submitting transaction',
            status: 'error',
            duration: 3000,
            position: 'bottom',
        })
        close()
        setStatus()
    }

    return (
        <Accordion allowToggle>
            <AccordionItem>
                <AccordionButton>
                    <Text>{name}</Text>
                    <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                    {params.map((param, index) => {
                        return <Box><Input key={name + param} placeholder={param} value={values[index]} onChange={(evt) => {
                            let vals = { ...values }
                            vals[param] = evt.target.value
                            setValue(vals)
                        }
                        } />
                            <RadioGroup name="param-type" onChange={(evt) => {
                                let newTypes = { ...types }
                                newTypes[param] = evt.toString()
                                setType(newTypes)
                            }}
                                value={types[param]}
                                direction="horizontal" >
                                <Radio value="string">String</Radio>
                                <Radio value="integer">Integer</Radio>
                                <Radio value="float">Float</Radio>
                            </RadioGroup>
                        </Box>
                    })}
                    {methodType === 'write' ? <>
                        {!isOpen && !txnStatus && <Button onClick={() => {
                            onToggle();
                            testFunction(name, contractId, values, state.key, types)
                                .then(res => setStatus(res))
                        }}
                        >Test Contract Method Call</Button>}
                    </>
                        :
                        <>
                            {!isOpen ? <Button onClick={() => {
                                onToggle();
                                runFunction(name, contractId, values, state.key, types, methodType)
                                    .then(res => setStatus(res))
                            }}>Read Contract</Button> :
                                <Button onClick={() => {
                                    onToggle();
                                    setStatus();
                                }}>Start Over</Button>}
                        </>
                    }
                    <Collapse in={isOpen}>
                        {methodType === 'write' ? <VStack>
                            {txnStatus ? <Text>Transaction status is {txnStatus}</Text> : <Spinner />}
                            <HStack>
                                <Button onClick={() => submitTransaction(onToggle)}>Live dangerously!</Button>
                                <Button onClick={() => {
                                    onToggle();
                                    setStatus();
                                }}>Start Over</Button>
                            </HStack>
                            </VStack>
                            : <Code>
                                <Text>Method Result</Text>
                                {txnStatus ? <Textarea isReadOnly overflow="scroll" height="200px" readOnly={true} fontSize='xs' defaultValue={JSON.stringify(txnStatus, null, 2)} /> : <Spinner />}
                            </Code>
                        }
                    </Collapse>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    )
}
