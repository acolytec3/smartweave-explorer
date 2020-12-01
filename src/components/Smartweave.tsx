import React from 'react'
import { Button, Input, Code, List, ListItem, Textarea, VStack, Accordion, AccordionButton, AccordionItem, AccordionPanel, Text } from '@chakra-ui/core';
import { getTxnData, testFunction } from '../providers/wallets'
import WalletContext from '../context/walletContext'
const acorn = require("acorn")
const walk = require("acorn-walk")

interface FunctionCallProps {
    name: string,
    params: string[]
}
const SmartweaveExplorer = () => {
    const [contractSource, setSource] = React.useState('')
    const [contractId, setID] = React.useState('')
    const [methods, setMethods] = React.useState([] as any[])
    const { state } = React.useContext(WalletContext)

    const getSource = async () => {
        let res = await getTxnData(contractId)
        console.log(res)
        setSource(res)
        if (res) {
            setSource(res)
            let src = await acorn.parse(res, { ecmaVersion: "latest", sourceType: "module" })
            console.log(getTypeChecks(src, "target"))
            //@ts-ignore
            window.source = src
            //@ts-ignore
            window.walk = walk
            let methods: string[]
            if (src.body[0].declaration.id.name === 'handle') {
                methods = src.body[0].declaration.body.body.filter((node: any) => node.type === "IfStatement" && node.test.left.object.name === "input")
                let methodNames = methods.map((node: any) => {
                    let name = node.test.right.value
                    let params = node.consequent.body.filter((param: any) => param.type == "VariableDeclaration" && (param.declarations[0].init.object.name === "input"))
                    let paramNames = params.map((param: any) => param.declarations[0].id.name)
                    return {
                        name: name,
                        params: paramNames
                    }
                })
                setMethods(methodNames)
            }
        }

    }

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
                        if (node.test.argument).argum
                }
            }
        });
        return names;
    }

    const FunctionCall: React.FC<FunctionCallProps> = ({ name, params }) => {
        const [values, setValue] = React.useState({} as any)
        return (
            <Accordion>
                <AccordionItem>
                    <Text>{name}</Text>
                    <AccordionButton />
                    <AccordionPanel>
                        {params.map((param, index) => {
                            return <Input key={name + param} placeholder={param} value={values[index]} onChange={(evt) => {
                                let vals = { ...values }
                                vals[param] = evt.target.value
                                console.log(vals)
                                setValue(vals)
                            }
                            } />
                        })}
                        <Button onClick={() => testFunction(name, contractId, params, state.key)}>Call Contract Method</Button>
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