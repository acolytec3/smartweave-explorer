//@ts-expect-error
import Verto from '@verto/lib'
import { getArweaveInstance } from './wallets'

const getVerto = async (key: any) => {
    let arweave = await getArweaveInstance()
    console.log('got arweave!')
    return new Verto()
}

export const getLatestPrice = async (contractID : string, key: any) : Promise<number> => {
    let verto = await getVerto(key)
    console.log('got verto', verto)
    return await verto.latestPrice(contractID)
}