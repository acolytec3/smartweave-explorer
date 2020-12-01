import Arweave from 'arweave'
import axios from 'axios'
import { interactWriteDryRun, interactWrite } from 'smartweave'
import { getContract } from 'cacheweave'
//@ts-ignore
import { generateKeyPair } from 'human-crypto-keys'
import { token } from '../context/walletContext'
import { JWKInterface } from 'arweave/node/lib/wallet'

export const getArweaveInstance = () => {
  return Arweave.init({
    host: 'arweave.net',
    port: 443,
  })
}

export const getBlockHeight = async (): Promise<number> => {
  let arweave = await getArweaveInstance()
  let res = await arweave.network.getInfo()
  return res.height
}

export const addWallet = async (wallet: any): Promise<{ address: string, balance: string }> => {
  let arweave = getArweaveInstance()
  let address = ''
  if (typeof wallet === "string") address = wallet;
  else address = await arweave.wallets.jwkToAddress(wallet)
  let balance = arweave.ar.winstonToAr(await arweave.wallets.getBalance(address))
  return { address, balance }
}

export const getToken = async (contractID: string) : Promise<token> => {
  let arweave = getArweaveInstance()
  let token = await getContract(arweave, contractID)
  return { ticker: token.ticker, contract: contractID, contractState: token }
}

export interface gQLParams {
  address?: string,
  name?: string,
  value?: string,
  to?: string,
  cursor?: string
}

export const getTxns = async ({ address = undefined, name = undefined, value = undefined, to = undefined, cursor = undefined }: gQLParams): Promise<any> => {
  let searchQuery = `first: 10 
    ${address ? 'owners:["' + address + '"]' : ''}
    ${cursor ? 'after:"' + cursor + '"' : ''} 
    ${name ? 'tags:{name:"' + name + '",values:["' + value + '"]}' : ''}
    ${to ? 'recipients:  ["' + to + '"]' : ''}`
  return axios.post('https://arweave.net/graphql', {
    query: `query {
                transactions(${searchQuery}
                 ) {
                  edges {
                    cursor
                    node {
                      id
                      recipient
                      tags {
                        name
                        value
                      }
                      fee {
                        winston
                        ar
                      }
                      quantity {
                        winston
                        ar
                      }
                      owner {
                        address
                      }
                    }
                  }
                }
              }`
  })
    .then((res) => {
      return res.data.data.transactions.edges
    })
    .catch((err) => {
      console.log(err)
      return []
    })
}


export const getFee = async (size: number): Promise<string> => {
  let res = await axios.get(`https://arweave.net:443/price/${size}`)
  let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
  })
  return arweave.ar.winstonToAr(res.data)
}

export const sendTransfer = async (transfer: any, key: any): Promise<string> => {
  try {
    let arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
    })
    let transaction = await arweave.createTransaction({
      target: transfer.to,
      quantity: arweave.ar.arToWinston(transfer.amount)
    }, key);

    transaction.addTag('App-Name', 'ArMob 2.0')
    await arweave.transactions.sign(transaction, key);

    const response = await arweave.transactions.post(transaction);
    console.log(response);
  }
  catch (err) {
    console.log(`Error sending tranfer - ${err}`)
    return `Error submitting transaction - ${err}`
  }
  return 'Transaction submitted successfully'
}

export const sendTokens = async (contract: string, amount: number, target: string, key: any): Promise<string | boolean> => {
  try {
    let arweave = getArweaveInstance()
    let res = await interactWriteDryRun(arweave, key, contract, {
      target: target,
      qty: amount,
      function: 'transfer'
    })
    console.log('Dry-run result is:', res)
    if (res.type === 'ok') {
      let txId = await interactWrite(arweave, key, contract, {
        target: target,
        qty: amount,
        function: 'transfer'
      })
      console.log(res)
      return txId
    }
    return "success!"
  }
  catch (err) {
    console.log(err)
    return (err.toString())
  }
}

export const uploadFile = async (data: File, key: JWKInterface, tags: { name: string; value: string; }[]) => {
  try {
    let arweave = getArweaveInstance()
    let buffer = await data.arrayBuffer()
    let transaction = await arweave.createTransaction({ data: buffer }, key)
    tags.forEach((tag) => transaction.addTag(tag.name, tag.value))
    await arweave.transactions.sign(transaction, key)
    const response = await arweave.transactions.post(transaction);
    console.log(response);
  }
  catch (err) {
    console.log(`Error sending tranfer - ${err}`)
    return `Error submitting transaction - ${err}`
  }
  return 'Transaction submitted successfully'
}

export const updateTokens = async (tokens: token[], address: string): Promise<token[] | false> => {
  let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
  })

  try {
    let tokenBalances = await Promise.all(tokens.map((token: token) =>
      getContract(arweave, token.contract).then(contractState => {
        console.log(contractState)
        if (contractState.balances)
          return { 'ticker': contractState.ticker as string, 'contract': token.contract, contractState: contractState }
        else return { 'ticker': '', 'contract': token.contract, contractState: contractState }
      })))
    return tokenBalances
  }
  catch (err) {
    console.log('Error updating tokens', err)
    return false
  }
}

export const generate = async (): Promise<string> => {
  return (await generateKeyPair('rsa', { modulusLength: 4096, format: 'raw-pem' })).mnemonic
}

export const timeLeft = (currentBlock: number, endBlock:number): string => {
  let timeLeft = (endBlock - currentBlock)/720
  if (timeLeft > 1) return `${Math.floor(timeLeft)} more days`
  else if (timeLeft > 0.041) return `${Math.floor(timeLeft*24)} more hours`
  else return 'less than 1 hour'
}

export const getAllCommunityIds = async (): Promise<string[]> => {
  let cursor = '';
  let hasNextPage = true;

  let client = getArweaveInstance()

  const ids: string[] = [];
  while (hasNextPage) {
    const query = {
          query: `
              query {
                  transactions(
                      tags: [
                          { name: "App-Name", values: ["SmartWeaveContract"] }
                          {
                              name: "Contract-Src"
                              values: ["ngMml4jmlxu0umpiQCsHgPX2pb_Yz6YDB8f7G6j-tpI"]
                          }
                      ]
                      after: "${cursor}"
                      first: 100
                  ) {
                      pageInfo {
                          hasNextPage
                      }
                      edges {
                          cursor
                          node {
                              id
                          }
                      }
                  }
              }            
          `,
    };
    const res = await client.api.post('/graphql', query);
    const data = res.data;

    for (let i = 0, j = data.data.transactions.edges.length; i < j; i++) {
          ids.push(data.data.transactions.edges[i].node.id);
    }
    hasNextPage = data.data.transactions.pageInfo.hasNextPage;

    if (hasNextPage) {
          cursor = data.data.transactions.edges[data.data.transactions.edges.length - 1].cursor;
    }
  }

  return ids;
}

export const getTxnData = async (txId: string): Promise<string> => {
  let arweave = getArweaveInstance()
  let query = { query: `
  query {
    transactions(ids: ["${txId}"]) {
        edges {
            node {
                id
              	tags {
                  name
                  value
                }
            }
        }
    }
}`}
  let res = await arweave.api.post('/graphql', query)
  console.log(res)
  let contractSrcTxn = res.data.data.transactions.edges[0].node.tags.filter((tag:any) => tag.name === 'Contract-Src')[0].value
  console.log(contractSrcTxn)
  let contractSource = await arweave.transactions.getData(contractSrcTxn, {decode: true, string: true}) as string
  return contractSource;
}

export const testFunction = async (method: string, contractId: string, params: any, key: JWKInterface, types: any) : Promise<string> => {
  let arweave = getArweaveInstance()
  console.log('params are')
  console.log(params)
  console.log('types are')
  console.log(types)
  let newParams = {...params}
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
  console.log(res)
  return res.type
}

export const runFunction = async (method: string, contractId: string, params: any, key: JWKInterface, types: any) : Promise<string | false> => {
  let arweave = getArweaveInstance()
  console.log('params are')
  console.log(params)
  console.log('types are')
  console.log(types)
  let newParams = {...params}
  for (let param in newParams) {
    if (types[param] === "integer") {
      newParams[param] = parseInt(params[param])
    }
    else if (types[param] === "float") {
      newParams[param] = parseFloat(params[param])
    }
  }
  let res = await interactWrite(arweave, key, contractId, {
    ...newParams,
    function: method
  })
  console.log(res)
  return res
}