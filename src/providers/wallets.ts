import Arweave from 'arweave'

export const addWallet = async (wallet: any): Promise<{ address: string, balance: string }> => {
    let arweave = Arweave.init({
      host:'arweave.net',
      port:443,
    })
    let address = await arweave.wallets.jwkToAddress(wallet)
    let balance = arweave.ar.winstonToAr(await arweave.wallets.getBalance(address))
    console.log(address);
    console.log(balance);
    return { address, balance }
  }

