import { walletState, wallet, tokenBalance } from '../context/walletContext';

const walletReducer = (state: walletState, action: { type: string, payload: any }): walletState => {
    console.log('Current state is:')
    console.log(state)
    console.log('Action requested is:')
    console.log(action)
    switch (action.type) {
        case 'ADD_WALLET': {
            let existingWallets = state.wallets?.filter((wallet: wallet)=> wallet.address === action.payload.address)
            let wallets = state.wallets
            if (existingWallets && existingWallets.length === 0)
                wallets?.push({address:action.payload.address, key:action.payload.key})
            return {
            ...state,
            key: action.payload.key,
            balance: action.payload.balance,
            address: action.payload.address,
            wallets: wallets
        }};
        case 'UPDATE_TOKENS': {
            return {
                ...state,
                tokens: action.payload.tokens
            }
        };
        case 'SET_PICTURE': {
            return {
                ...state,
                picture: action.payload.picture
            }
        }
        case 'SET_BLOCK_HEIGHT': {
            return {
                ...state,
                blockHeight: action.payload.blockHeight
            }
        }
        case 'SET_TOKEN_ADDRESSES': {
            return {
                ...state,
                tokenAddresses: action.payload.tokenAddresses
            }
        }
        default: return state
    }
}

export default walletReducer