import { walletState } from '../context/walletContext'

const walletReducer = (state: walletState, action: {type:string, payload: any}): walletState => {
    console.log('Current state is:', state)
    console.log('Action requested is:',action)
    switch (action.type) {
        case 'ADD_WALLET': return {...state, key: action.payload.key, balance: action.payload.balance, address: action.payload.address};
        default: return state
    }
}

export default walletReducer