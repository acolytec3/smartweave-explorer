import Arweave from 'arweave'
import axios from 'axios'
import { getContract } from 'cacheweave'

export const getArweaveInstance = () => {
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
  return { address, balance }
}

export interface gQLParams {
  address?: string,
  name?: string,
  value?: string,
  to?: string,
  cursor?: string
}

export const getFee = async (size: number): Promise<string> => {
  let res = await axios.get(`https://arweave.net:443/price/${size}`)
  let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
  })
  return arweave.ar.winstonToAr(res.data)
}

export const getTxnData = async (txId: string): Promise<string> => {
  let arweave = getArweaveInstance()
  let query = {
    query: `
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
  let contractSrcTxn = res.data.data.transactions.edges[0].node.tags.filter((tag: any) => tag.name === 'Contract-Src')[0].value
  console.log(contractSrcTxn)
  let contractSource = await arweave.transactions.getData(contractSrcTxn, { decode: true, string: true }) as string
  return contractSource;
}

export const getContractState = async (contractId: string): Promise<any> => {
  let arweave = getArweaveInstance()
  return await getContract(arweave, contractId)
}



