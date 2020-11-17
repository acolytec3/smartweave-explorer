# ArMob 2.0

A mobile wallet for the permaweb

## Usage

- Open [ArMob 2.0](https://acolytec3.github.io/ArMob-2.0)
- Load Wallet or paste in any Arweave address for read-only wallet view
- Prosper

## Features
- Send AR and PSTs directly from the app
- Load custom PSTs if not already displayed
- View last 10 transactions from any loaded wallet/address and associated metadata

## Additional thoughts
 - Your wallet **never ever** leaves your device.  That said, I make no guarantees about the security of your keys.
 - This app is mobile-first so it may look funky on desktop.  Forgive the whitespace
 - Your wallet is currently stored in an IndexedDB in browser storage and it's not encrypted if that is a concern. 
 - There are **no** fees applied through the use of this app.  A PST transfer is done by [directly calling](https://github.com/acolytec3/ArMob-2.0/blob/b730e534cff86664a49c5307baffd0367f1ba3a1/src/providers/wallets.ts#L165) the `transfer` method of the PST contract and no additional fees are applied.  
 - Trust but verify
 
 ## Roadmap
- [x] Support data transactions in various forms (file upload, take picture with device camera and post to Arweave, etc)
- [x] Support custom tags on any/all transactions
- [x] Allow transaction history filtering/searching
- [ ] Interact with all exposed Smartweave functions
- [ ] Read and view Smartweave contract state
- [x] Expanded PST interactions
    - [x] View vaulted balances
    - [ ] Integrate Verto buy/sell functionality
- [ ] Integrate ArweaveID support into wallet
- [ ] Support storing multiple wallets locally and switching between them

### Possible future work
- Dapp-specific integrations (e.g. WeaveMail, ArDrive, etc)
- Expose wallet API to allow secure signing of transactions in Dapps (like Metamask or other Ethereum based wallets)
- Conversion to full mobile app to support locking app with device biometric authentication (i.e. Face ID/Touch ID/Fingerprint Sensors)


