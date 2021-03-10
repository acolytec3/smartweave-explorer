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
  let contractSrcTxn = res.data.data.transactions.edges[0].node.tags.filter((tag: any) => tag.name === 'Contract-Src')[0].value
  let contractSource = await arweave.transactions.getData(contractSrcTxn, { decode: true, string: true }) as string
  return contractSource;
}

export const getContractState = async (contractId: string): Promise<any> => {
  let arweave = getArweaveInstance()
  return await getContract(arweave, contractId)
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

