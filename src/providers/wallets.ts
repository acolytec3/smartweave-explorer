import Arweave from 'arweave'
import axios from 'axios'
import { readContract, interactWriteDryRun, interactWrite } from 'smartweave'
//@ts-ignore
import { generateKeyPair, getKeyPairFromMnemonic } from 'human-crypto-keys'
import crypto from 'libp2p-crypto'
import { tokenBalance } from '../context/walletContext'

const getArweaveInstance = () => {
  return Arweave.init({
    host: 'arweave.net',
    port: 443,
  })
}

export const addWallet = async (wallet: any): Promise<{ address: string, balance: string }> => {
  let arweave = getArweaveInstance()
  let address = ''
  if (typeof wallet === "string") address = wallet;
  else address = await arweave.wallets.jwkToAddress(wallet)
  let balance = arweave.ar.winstonToAr(await arweave.wallets.getBalance(address))
  console.log(address);
  console.log(balance);

  return { address, balance }
}

export const getTokens = async (address: string): Promise<any[]> => {
  let arweave = getArweaveInstance()
  
  let res = await axios.post('https://arweave.net/graphql', {
    query: `query {
      transactions(first:20,
          owners:["${address}"],
          tags: [{
              name: "Exchange",
            values:["Verto"]
          }, {name:"Type", values:["Buy", "Sell"]}]
      ) {
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
  }`
  })
  let tokens = res.data.data.transactions.edges
  let vertoContracts = tokens.map((node: any) => node.node.tags.filter((tag: { name: string, value: string }) => tag.name === "Token")[0].value)
  res = await axios.post('https://arweave.net:443/graphql',{query:`query {
      transactions(first:20,
        	owners:["${address}"]
          tags: [{
              name: "App-Name",
            values:["SmartWeaveAction"]
          }]
      ) {
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
  }`})
  console.log('Verto contract interactions', vertoContracts)
  let smartweaveContracts = res.data.data.transactions.edges.map((edge:any) => edge.node.tags.filter((tag:any) => (tag.name === 'Contract'))[0].value)
  console.log('Generic Smartweave contract interactions', smartweaveContracts)
  let contracts = [...new Set(vertoContracts.concat(smartweaveContracts))]
  let tokenBalances = await Promise.all(contracts.map((contract: any) =>
    readContract(arweave, contract).then(contractState => {
      console.log(contractState)
      if (contractState.balances) {
        return { 'balance': contractState.balances[address], 'ticker': contractState.ticker, 'contract': contract }
      }
      else return null
    })))
    
  return tokenBalances
}

export const getTxns = async (address: string): Promise<any> => {
  return axios.post('https://arweave.net/graphql', {
      query: `query {
                transactions(owners:  ["${address}"]) {
                  edges {
                    node {
                      id
                      owner {
                        address
                      }
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
                    }
                  }
                }
              }`
    })
      .then((res) => {
        console.log(res.data)
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
    let arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
    })
    let res = await interactWriteDryRun(arweave, key, contract, {
      target: target,
      qty: amount,
      function: 'transfer'
    })
    console.log('Dry-run result is:',res)
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

export const updateTokens = async (tokens: tokenBalance[], address: string): Promise<tokenBalance[] | false> => {
  let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
  })
  try {
  let tokenBalances = await Promise.all(tokens.map((token: tokenBalance) =>
    readContract(arweave, token.contract).then(contractState => {
      console.log(contractState)
      if (contractState.balances)
      return { 'balance': contractState.balances[address] as number, 'ticker': contractState.ticker as string, 'contract': token.contract, contractState:contractState }
      else return {'balance':0, 'ticker':'', 'contract':token.contract,contractState:contractState}
    })))
  return tokenBalances
  }
  catch (err) {
    console.log('Error updating tokens', err)
    return false
  }
}

export const generate = async (): Promise<string> => {
  return (await generateKeyPair('rsa',{modulusLength:4096,format:'raw-pem'})).mnemonic
}

export const regurgitate = async (mnemonic: string): Promise<any> => {
  let keyPair = await getKeyPairFromMnemonic(mnemonic, 'rsa',{modulusLength:4096, format:'raw-pem'})
  let privateKey = await crypto.keys.import(keyPair.privateKey, '')
  //@ts-ignore
  return privateKey._key
}
