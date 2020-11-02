import Wallets from 'arweave/node/wallets';
import { walletState } from '../context/walletContext';

const walletReducer = (state: walletState, action: { type: string, payload: any }): walletState => {
    console.log('Current state is:', state)
    console.log('Action requested is:', action)
    switch (action.type) {
        case 'ADD_WALLET': {
            let existingWallets = state.wallets?.filter((address:string)=> address === action.payload.address)
            let wallets = state.wallets
            if (existingWallets && existingWallets.length === 0)
                wallets?.push(action.payload.address)
            return {
            ...state,
            key: action.payload.key,
            balance: action.payload.balance,
            address: action.payload.address,
            tokens: action.payload.tokens,
            wallets: wallets
        }};
        default: return state
    }
}

export default walletReducer