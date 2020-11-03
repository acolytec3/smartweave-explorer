//@ts-nocheck
import Arweave from 'arweave'
import axios from 'axios'
import { readContract } from 'smartweave'

export const addWallet = async (wallet: any): Promise<{ address: string, balance: string }> => {
  let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
  })
  let address = ''
  if (typeof wallet === "string") address = wallet;
  else address = await arweave.wallets.jwkToAddress(wallet)
  let balance = arweave.ar.winstonToAr(await arweave.wallets.getBalance(address))
  console.log(address);
  console.log(balance);
  return { address, balance }
}

export const getTokens = async (address: string): Promise<any[]> => {
  let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
  })
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
  let vertoContracts = [...new Set(tokens.map((node: any) => node.node.tags.filter((tag: { name: string, value: string }) => tag.name == "Token")[0].value))]
  res = await ax.post('https://arweave.net:443/graphql',{query:`query {
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
  let smartweaveContracts = [...new Set(res.data.data.transactions.edges.map((edge) => edge.node.tags.filter((tag) => (tag.name == 'Contract'))[0].value))]
  console.log('Generic Smartweave contract interactions', smartweaveContracts)
  let contracts = vertoContracts.concat(smartweaveContracts)
  let tokenBalances = await Promise.all(contracts.map((contract: any) =>
    readContract(arweave, contract).then(contractState => {
      if (contractState.balances)
      return { 'balance': contractState.balances[address], 'ticker': contractState.ticker }
    })))
  return tokenBalances
}