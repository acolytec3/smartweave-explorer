import Verto from '@verto/lib'
import { getArweaveInstance } from './wallets'
import { JWKInterface } from "arweave/node/lib/wallet";

const getVerto = async (key: any) => {
    let arweave = getArweaveInstance()
    return new Verto(key)
}

export const getOpenBuyDeets = async (contractID: string, key: JWKInterface): Promise<{ volume: number, averageRate: number, rates: any[] }> => {
    let verto = await getVerto(key)
    let tPosts = await verto.getTradingPosts()
    let config = await verto.getConfig(tPosts[0])
    if (config.hasOwnProperty('publicURL')) {
        //@ts-ignore
        let res = await (await (await fetch(`https://${config.publicURL}/orders`))).json()
        let orders = res.find((token: any) => token.token === contractID).orders.filter((order: any) => order.type === "Sell")
        .sort((orderA:any,orderB:any) => orderB.rate - orderA.rate )
        let totalOrders = orders.reduce((total: number, order: any) => total + order.amnt, 0)
        let averageRate = orders.reduce((average: number, order: any) => average + (order.amnt / totalOrders) * order.rate, 0)
        let individualRates = orders.map((order:any) => {return ({rate: 1/order.rate, amount: order.amnt})})
        return { volume: totalOrders, averageRate: 1 / averageRate, rates: individualRates }
    }
    else return { volume: 0, averageRate: 0, rates:[] }
}

export const getOpenSellDeets = async (contractID: string, key: JWKInterface): Promise<{ volume: number, averageRate: number, rates: any[] }> => {
    let verto = await getVerto(key)
    let tPosts = await verto.getTradingPosts()
    let config = await verto.getConfig(tPosts[0])
    if (config.hasOwnProperty('publicURL')) {
        //@ts-ignore
        let res = await (await (await fetch(`https://${config.publicURL}/orders`))).json()
        let orders = res.find((token: any) => token.token === contractID).orders.filter((order: any) => order.type === "Buy")
        .sort((orderA:any,orderB:any) => orderA.rate - orderB.rate )
        let totalOrders = orders.reduce((total: number, order: any) => total + order.amnt, 0)
        let averageRate = orders.reduce((average: number, order: any) => average + (order.amnt / totalOrders) * order.rate, 0)
        let individualRates = orders.map((order:any) => {return ({rate: order.rate, amount: order.amnt})})
        return { volume: totalOrders, averageRate: averageRate, rates: individualRates }
    }
    else return { volume: 0, averageRate: 0, rates: []}
}

export const trade = async (trade: string, amount: number, key: JWKInterface, contractID: string): Promise<any> => {
    let verto = await getVerto(key)
    let tPosts = await verto.getTradingPosts()
    let txns = await verto.createOrder(trade, amount, contractID, tPosts[0])
    console.log(txns)
    return txns
}