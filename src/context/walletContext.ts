import { createContext } from 'react'

export type walletState = {
    key : any,
    balance: string,
    address: string
}
export const initWalletState: walletState = {
        key: {} as any,
        balance: '',
        address: ''
}

const WalletContext = createContext<{state:walletState, dispatch: React.Dispatch<any>}>({state: initWalletState, dispatch: () => null} )

export { WalletContext as default }