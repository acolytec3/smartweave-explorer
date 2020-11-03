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
  let contracts = tokens.map((node: any) => node.node.tags.filter((tag: { name: string, value: string }) => tag.name == "Token")[0].value)
  console.log(contracts)
  let tokenBalances = await Promise.all(contracts.map((contract: any) =>
    readContract(arweave, contract).then(contractState => {
      return { 'balance': contractState.balances['bLkyTRJCYg8WxBKrjBwAaRe1H7HYDfXzl7YKCENvw-Q'], 'ticker': contractState.ticker }
    })))

  return tokenBalances
}