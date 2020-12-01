import React from 'react'
import { Button, Input, Code, List, ListItem, Textarea, VStack, Accordion, AccordionButton, useToast, AccordionItem, AccordionPanel, Text, Box, RadioGroup, Radio, PopoverTrigger, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, Spinner, PopoverContent } from '@chakra-ui/core';
import { getTxnData, runFunction, testFunction } from '../providers/wallets'
import WalletContext from '../context/walletContext'
const acorn = require("acorn")

interface FunctionCallProps {
    name: string,
    params: string[],
}
const SmartweaveExplorer = () => {
    const [contractSource, setSource] = React.useState('')
    const [contractId, setID] = React.useState('')
    const [methods, setMethods] = React.useState([] as any[])
    const [txnStatus, setStatus] = React.useState('')
    const { state } = React.useContext(WalletContext)


    const getSource = async () => {
        let res = await getTxnData(contractId)
        setSource(res)
        if (res) {
            setSource(res)
            let src = await acorn.parse(res, { ecmaVersion: "latest", sourceType: "module" })
            //@ts-ignore
            window.source = src
            let methods: string[]
            if (src.body[0].declaration.id.name === 'handle') {
                methods = src.body[0].declaration.body.body.filter((node: any) => node.type === "IfStatement" && node.test.left.object.name === "input")
                let methodNames = methods.map((node: any) => {
                    try {
                        let name = node.test.right.value
                        let params = node.consequent.body.filter((param: any) => param.type == "VariableDeclaration" && (param.declarations[0].init.object.name === "input"))
                        let paramNames = params.map((param: any) => param.declarations[0].id.name)
                        return {
                            name: name,
                            params: paramNames
                        }
                    }
                    catch (err) {
                        console.log(err)
                        return {}
                    }
                })
                setMethods(methodNames.filter((method) => method.name))
            }
        }

    }

    const FunctionCall: React.FC<FunctionCallProps> = ({ name, params }) => {
        const [values, setValue] = React.useState({} as any)
        const [types, setType] = React.useState({} as any)
        const toast = useToast();

        const submitTransaction = async (close: () => void) => {
            let res = await runFunction(name, contractId, values, state.key, types)
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
        }
        return (
            <Accordion>
                <AccordionItem>
                    <Text>{name}</Text>
                    <AccordionButton />
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
                        <Popover
                            closeOnBlur={false}>
                            {({ onClose }) =>
                                <>
                                    <PopoverTrigger>
                                        <Button onClick={() => {
                                            testFunction(name, contractId, values, state.key, types)
                                                .then(res => setStatus(res))
                                        }}
                                        >Call Contract Method</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                    <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody>
                                            {txnStatus ? `Transaction status is ${txnStatus}` : <Spinner />}
                                            <Button onClick={() => submitTransaction(onClose)}>Live dangerously!</Button>
                                        </PopoverBody>
                                    </PopoverContent>
                                </>}
                        </Popover>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        )
    }

    return (<VStack>
        <Input placeholder="Smartweave Contract ID" value={contractId} onChange={(evt) => setID(evt.target.value)} />
        <Button onClick={getSource}>Load Contract</Button>
        <Code w="100%">
            <Textarea overflow="scroll" height="200px" readOnly={true} fontSize='xs' isReadOnly defaultValue={contractSource} />
        </Code>
        <List>
            {methods && methods.map((method: FunctionCallProps) => <ListItem>
                <FunctionCall name={method.name} params={method.params} />
            </ListItem>)}
        </List>
    </VStack>
    )
}

export default SmartweaveExplorer

/*
    const getTypeChecks = (src: any, param: string): any => {
        let names: any[] = []
        walk.simple(src, {
            IfStatement: function (node: any) {
                console.log(node)
                switch (node.test.type) {
                    case "UnaryExpression":
                        if (node.test.argument.arguments && node.test.argument.arguments[0].name === param)
                            names.push(node.test);
                        else if (node.test.argument.name === param)
                            names.push(node.test)
                        break;
                    case "BinaryExpression":
                        if (node.test.argument)
                            names.push(node.test)
                }
            }
        });
        return names;
    }
    */