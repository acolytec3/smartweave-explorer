import Arweave from 'arweave'
import { interactWriteDryRun, interactWrite, interactRead, } from 'smartweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
const acorn = require("acorn");
const walk = require('acorn-walk');

export const getArweaveInstance = () => {
    return Arweave.init({
        host: 'arweave.net',
        port: 443,
    })
}

export interface FunctionCallProps {
    name: string;
    params: string[];
    methodType: string;
}

const getParamNames = (node:any):string[] => {
    let paramNames: string[] = []
    walk.recursive(node, [], {
        VariableDeclaration(node: any) {
            if (node.declarations[0]?.init?.object?.name === "input") {
                paramNames.push(node.declarations[0].init.property.name)
            }
            else if (node.declarations[0]?.init?.left?.object?.name === "input") {
                paramNames.push(node.declarations[0].init.left.property.name)
            }
            else if (node.declarations[0]?.init?.argument?.object?.name === "input") {
                paramNames.push(node.declarations[0].init.argument.property.name)
            }
        }
    });
    return paramNames
}
export const getInputMethods = (
    contractSource: string
): {
    readMethods: FunctionCallProps[];
    writeMethods: FunctionCallProps[];
} | undefined => {
    let src = acorn.parse(contractSource, {
        ecmaVersion: "latest",
        sourceType: "module",
    });
    if (src.body[0].declaration.id.name === "handle") {
        let allMethods = src.body[0].declaration.body.body.filter(
            (node: any) =>
                node.type === "IfStatement" &&
                node.test.left.object.name === "input"
        );
        let readMethods: FunctionCallProps[] = [];
        let writeMethods: FunctionCallProps[] = [];
        allMethods.forEach((node: any) => {
            console.log(node)
            if (
                node.test.type === "BinaryExpression" &&
                node.test.left.object &&
                node.test.left.object.name === "input"
            ) {

                try {
                    let returnStatement =
                        node.consequent.body[node.consequent.body.length - 1]; //Get write methods
                    if (
                        returnStatement.type === "ReturnStatement" &&
                        returnStatement.argument.properties[0].key.name === "state"
                    ) {
                        let paramNames = getParamNames(node);
                        let name = node.test.right.value;
                        writeMethods.push({
                            name: name,
                            params: paramNames,
                            methodType: "write",
                        });
                    } else {
                        //Get read methods
                        let paramNames = getParamNames(node);
                        let name = node.test.right.value;
                        readMethods.push({
                            name: name,
                            params: paramNames,
                            methodType: "read",
                        });
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        });
        return { readMethods, writeMethods };
    }
    return undefined
}

export const testFunction = async (method: string, contractId: string, params: any, key: JWKInterface, types: any): Promise<string> => {
    let arweave = getArweaveInstance()
    let newParams = { ...params }
    for (let param in newParams) {
        if (types[param] === "integer") {
            newParams[param] = parseInt(params[param])
        }
        else if (types[param] === "float") {
            newParams[param] = parseFloat(params[param])
        }
    }
    let res = await interactWriteDryRun(arweave, key, contractId, {
        ...newParams,
        function: method
    })
    return res.type
}

export const runFunction = async (method: string, contractId: string, params: any, key: JWKInterface, types: any, methodType: string): Promise<any> => {
    let arweave = getArweaveInstance()
    console.log('params are')
    console.log(params)
    console.log('types are')
    console.log(types)
    let newParams = { ...params }
    for (let param in newParams) {
        if (types[param] === "integer") {
            newParams[param] = parseInt(params[param])
        }
        else if (types[param] === "float") {
            newParams[param] = parseFloat(params[param])
        }
    }
    let res: string | false
    if (methodType === 'write') {
        res = await interactWrite(arweave, key, contractId, {
            ...newParams,
            function: method
        })
    }
    else res = (await interactRead(arweave, key, contractId, {
        ...newParams,
        function: method
    }))
    console.log(res)
    return res
}
