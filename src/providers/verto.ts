import Verto from '@verto/lib'
import { getArweaveInstance } from './wallets'

const getVerto = async (key: any) => {
    let arweave = getArweaveInstance()
    return new Verto(key)
}

export const getOpenBuyDeets = async (contractID : string, key: any) : Promise<{volume: number, averageRate: number}> => {
    let verto = await getVerto(key)
    let tPosts = await verto.getTradingPosts()
    let config = await verto.getConfig(tPosts[0])
    let res = await (await (await fetch(`https://${config.publicURL}/orders`))).json()
    let orders = res.find((token : any) => token.token === contractID ).orders.filter((order:any) => order.type === "Sell")
    let totalOrders = orders.reduce((total: number, order:any) => total + order.amnt, 0)
    let averageRate = orders.reduce((average: number, order:any) => average + (order.amnt/totalOrders)*order.rate,0)
    return {volume: totalOrders, averageRate: 1/averageRate}
}

export const getOpenSellDeets = async (contractID : string, key: any) : Promise<{volume: number, averageRate: number}> => {
    let verto = await getVerto(key)
    let tPosts = await verto.getTradingPosts()
    let config = await verto.getConfig(tPosts[0])
    console.log(config)
    let res = await (await (await fetch(`https://${config.publicURL}/orders`))).json()
    let orders = res.find((token : any) => token.token === contractID ).orders.filter((order:any) => order.type === "Buy")
    let totalOrders = orders.reduce((total: number, order:any) => total + order.amnt, 0)
    let averageRate = orders.reduce((average: number, order:any) => average + (order.amnt/totalOrders)*order.rate,0)
    return {volume: totalOrders, averageRate: averageRate}
}