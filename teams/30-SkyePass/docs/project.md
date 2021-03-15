## Project Overview

SkyePass is a decentralized and customizable identity management software. On the surface, it is a decentralized, open source and modern password manager. 

### Product Details

As a long-term password manager software user myself, I have been really frustrated of the services like LastPass, 1Password for either lack of functionalities or the idea of storing ones entire digital identity on their corporate servers. Existing open-source solutions are too technically complicated to use. 

At the very basis of it, a password manager is no more than an encrypted database, an APP and a browser extension to interact with the database. 

Therefore, our team create a new password manger software that has pretty and intuitive UI/UX, fully decentralized (i.e. our team own no backend servers) and hackable by providing an open API for people to develop extensions with. 

Users who signup will first create a blockchain wallet and have the mnemonic (and a master password) as their sole identity credentials (pretty standard blockchain wallet stuff). Later, each database instance is called a `vault` (standard name for all password managers) and they are light-weight file based databases ([lowDB](https://github.com/typicode/lowdb) seems to be a great choice). User can be given options to choose the encryption behavior of their database. By default, the vault will be split into some pieces with a Shamir's secret sharing mechanism. 

For instance, for a simplest sharing schema, when the vault is created to be shared with 2 other family members, the vault will be split into 4 parts (we call them `horcrux`, for those who do not know [the Harry Potter reference](http://harrypotter.shoutwiki.com/wiki/Horcrux#:~:text=A%20Horcrux%20is%20a%20powerful,one%20is%20to%20true%20immortality.) ) with a minimum quorum of 2 to be decrypted. One piece will be sent to IPFS without encryption, the other 3 pieces will be encrypted by each member's public key and be sent to IPFS. An NFT will be minted for the owner. The ID of the NFT will be the `vault ID` and the NFT's URI will be a metadata piece that only the owner can change as exampled below: 

```json
{
    "pieces": 4,
    "quorum": 2,
    "nonce": 20,
    "owner": "5Ef9ES1SLQZU4KucGsjvs8qexvppQFmDgHiqoqVptJ9nZDeu",
    "members": [
        "5EKj6S1SLQZU4KucGsjvs8qexvppQFmDgHiqsdsdtJ9nZ123",
        "5EJK1S1SLQZjkLKucGsjvs8qekdjpQFmDgHiqoqVptJ9nZ978"
    ],
    "unencrypted_cid": "QmaTX2v2QuwkQvEERw17w2xACcr2WZhy9t3NAEPBjvqPSX",
    "encrypted_cids": [
        {
            "cid":       "QmaTX2v2QuwkQvEERw17w2xACcr2WZhy9t3NAEPBjvqPSX",
            "member": "5EKj6S1SLQZU4KucGsjvs8qexvppQFmDgHiqsdsdtJ9nZ123"
        },{
            "cid":       "QmaTX2v2QuwkQvEERw17w2xACcr2WZhy9t3NAEPBjvqPSX",
            "member": "5EJK1S1SLQZjkLKucGsjvs8qekdjpQFmDgHiqoqVptJ9nZ978"
        }, {
            "cid":       "QmaTX2v2QuwkQvEERw17w2xACcr2WZhy9t3NAEPBjvqPSX",
            "member": "5Ef9ES1SLQZU4KucGsjvs8qexvppQFmDgHiqoqVptJ9nZDeu"
        }
    ]
}
```



The reason why we design such mechanism serves 3 purposes. 

1. Reserve the capacity for advanced users to create more complicated sharing schema. 
    - For instance, a user can create a vault and assign trustee to take over one's estate when the user passes away. The user can split the vault to 5 `horcrux` and set the minimum decryption quorum to 3. 2 pieces encrypted with the user's own public key, 1 piece encrypted with a trustee A's public key, 1 piece encrypted with another trustee B's public key and 1 last piece to the user's lawyer. In event of death, A and B can go to the lawyer and decrypt the vault and inherit the user's digital identities. 
    - A team can create a vault that requires 2 members to decrypt a vault, or require the owner's piece to decrypt a vault etc.
2. Because the historical metadata states are all stored on the blockchain, it is not hard to rebuild the change history of the vault.
3. Make it easier to check the integrity of the vault and recover the vault.
4. Leave the option open for future commercial projects to offer zero-knowledge vault backup service. 

To manage access for users, we assume two common roles: `write` and `read` and, of course, `owner`. Because each time when the database is updated (i.e. new password saved), the IPFS CID will be updated, managing access is easy. The owner can add the member's address to be `approved` to change the URI in the smart contract and be responsible to update all CIDs when a client is updating the database. While those who have a `horcrux` but not in the `approved list` in the smart contract, they cannot update the database because they cannot update the metadata. 

So far, we have discussed a system to securely create, share and manage a minimalism decentralized file-based database. Our team believe there are more we can do with the database file itself and that's why we are calling SkyePass hackable. If we think about blockchain wallet applications, they are web applications that store some private keys and call APIs like `Web3.js`. Taking inspiration from Ledger, we believe if we expose some APIs for developers to make extensions(like the idea of Applications for Ledger), we can make a password manager infinitely interesting. Because the vault is shareable to others, users can share a whole workspace to others will all sensitive information included. These extensions can be made both in a desktop applications or a browser extension. 

Some ideas we have had so far:

- `Crypto Wallet`: shared hot wallet. The owner of the vault can install an `Ethereum` extension and store the private key with it. And, of course, DApp browsers. 
- `SSH Login Tool`: a whole team can share login credential to their server effortlessly. 
- `Shared Phone Number`: a shared Google account that registered on `Google Voice` can be stored, and the whole family can receive verification code for services. 



### Password Manager & an Identity Management Solution

Based on some thinking of the basis nature of NFTs. We believe that a password manager is an ideal medium to deliver tokenized digital identities. Therefore, we think each username-password-OTP combination as an atomic token, a vault as a collection of these identities, and an `extension` as a service injected with an identity. 

- If we assume all identity tokens have two states: "public identity" or "private identity". A public handle is the public identity of a user. (i.e. a twitter handler, a Github handle or a Venmo handle etc. ) Therefore, we are building a solution to link to one's public off-chain profiles. Also, we can implement a ENS-like or `@username` style handle system.
- Therefore, simple sharing behavior (i.e. share my spotify account to my girlfriend) can take two forms: if she has an account with this password manager, simple `@her`, set some rules for using this password(or not) and press share. If she has not, a one time sharing link will be sent, her browser will generate an ephemeral key pair, and that ephemeral key pair will be used to encrypted the entry and send the encrypted password entry over and make it self-destruct soon.
- For teams or families, they are using a shared identity. They can link their profiles and get a handle like `@team`, while the team will use some secret sharing schema for privilege management.

### UI/UX Mockup


![MacBook Pro - 5](https://tva1.sinaimg.cn/large/008eGmZEly1gmh1l2kl90j31c00u0ac0.jpg)

![MacBook Pro - 1](https://tva1.sinaimg.cn/large/008eGmZEly1gmh1l4ozqkj31c00u0dl4.jpg)

![MacBook Pro - 2](https://tva1.sinaimg.cn/large/008eGmZEly1gmh1l3k86lj31c00u0431.jpg)

![MacBook Pro - 4](https://tva1.sinaimg.cn/large/008eGmZEly1gmh1l5w0ujj31c00u0tc0.jpg)

![MacBook Pro - 3](https://tva1.sinaimg.cn/large/008eGmZEly1gmh1l6q8c4j31c00u0778.jpg)

### Cross-Comparison with Other Password Managers

We have not included all popular ones. These are just ones we have actually used. 

|                                      | SkyePass | 1Password | LastPass | NordPass | RememBear | KeePass |
| ------------------------------------ | -------- | --------- | -------- | -------- | --------- | ------------------------------------ |
| Release Year | 2021 | 2006 | 2008 | 2019 | 2018 | 2003 |
| Zero-Knowledge Vault                 | Yes | Yes | Yes | Yes | Yes |Yes|
| Product Type                         | Opensource | Commercial | Commercial | Commercial | Commercial |Opensource|
| Account & Vault Metadata             | Stored On Blockchain | Corporate Servers | Corporate Servers | Corporate Servers | Corporate Servers |Local by default|
| Decentralized                        | Yes | No | No | No | No |Kind of|
| 2FA Login Protection                 | No | Yes | Yes | Yes | No |N/A|
| Shared Vault                         | Yes | Yes | No | No | No | Kind Of                      |
| Custom Sharing Schema | Yes & expose APIs to do so | Yes. With Business accounts | No | No | No |With plugins|
| Intuitive & Morden UI/UX             | Intuitive and Beautiful | Good but Not Intuitive | Intuitive But not so Beautiful | Intuitive and Beautiful | Intuitive and Astonishing; Possibly the Best |Old, professional users only|
| Fill Web Forms & Websites Auto Login | Yes | Yes | Yes | Yes | Yes |with plugins|
| Password Strength Report             | Not by default but open for plugins | Fantastic | Good | OK | OK |No|
| Digital Legacy                       | Yes! | No | Yes | No | No |NO|
| Import From Browsers                 | Not Now. Will be Supported after Beta Release | Yes | Yes | Yes | Yes |With plugins|
| Extensibility                        | Core Feature! | No | No | No | No |Yes!|

