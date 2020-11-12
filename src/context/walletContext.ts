import { createContext } from 'react'

export type tokenBalance = {
    ticker: string,
    balance: number,
    contract: string,
    contractState: any
}

export type wallet = {
    address: string,
    key?: any
}
export type walletState = {
    key : any,
    balance: string,
    address: string,
    tokens?: tokenBalance[],
    wallets?: wallet[],
    picture?: string
}
export const initWalletState: walletState = {
        key: {} as any,
        balance: '',
        address: ''
}

const WalletContext = createContext<{state:walletState, dispatch: React.Dispatch<any>}>({state: initWalletState, dispatch: () => null} )

export { WalletContext as default }