# ArMob 2.0

A mobile wallet for the permaweb

## Usage

- Open [ArMob 2.0](https://acolytec3.github.io/armob-2.0)
- Load Wallet or paste in any Arweave address for read-only wallet view
- Prosper

## Features
- Load wallets from either JSON or BIP39 mnemonics
- Send AR and PSTs directly from the app without any fees other than network fees
- Load custom PSTs if not already displayed
- Trade PSTs you own through the Verto network
- See vaulted balances for PSTs associated with any profit sharing community
- View historical transactions from any loaded wallet/address and associated metadata
- Search transactions based on tag name/value
- Manage multiple wallets within the app
- Upload pictures direcctly from device camera
- Upload files from device

## Additional thoughts
 - Your wallet **never ever** leaves your device.  That said, I make no guarantees about the security of your keys. It's the same as leaving your wallet key file lying around on your hard drive.
 - This app is mobile-first so it may look funky on desktop.  Forgive the whitespace
 - Your wallet is currently stored in an IndexedDB in browser storage and it's not encrypted if that is a concern. 
 - There are **no** fees applied through the use of this app.  A PST transfer is done by [directly calling](https://github.com/acolytec3/ArMob-2.0/blob/b730e534cff86664a49c5307baffd0367f1ba3a1/src/providers/wallets.ts#L165) the `transfer` method of the PST contract and no additional fees are applied.  
 - Trust but verify
 
 ## Roadmap
- [x] Support data transactions in various forms (file upload, take picture with device camera and post to Arweave, etc)
- [x] Support custom tags on any/all transactions
- [x] Allow transaction history filtering/searching
- [x] Interact with all exposed Smartweave functions
- [x] Read and view Smartweave contract state
- [x] Expanded PST interactions
    - [x] View vaulted balances
    - [x] Integrate Verto buy/sell functionality
- [ ] Integrate ArweaveID support into wallet
- [x] Support storing multiple wallets locally and switching between them

### Possible future work
- Dapp-specific integrations (e.g. WeaveMail, ArDrive, etc)
- Expose wallet API to allow secure signing of transactions in Dapps (like Metamask or other Ethereum based wallets)
- Conversion to full mobile app to support locking app with device biometric authentication (i.e. Face ID/Touch ID/Fingerprint Sensors)

### Contributions
[John Letey](https://github.com/johnletey) for the query structure for retrieving all PSTs and for [cacheweave](https://github.com/johnletey/cacheweave)
