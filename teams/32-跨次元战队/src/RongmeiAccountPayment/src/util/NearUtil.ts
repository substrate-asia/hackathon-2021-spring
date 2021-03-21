// Load environment variables
import {AccountAlreadyExistsException} from "../exception/AccountAlreadyExistsException";
import {UserUtil} from "./UserUtil";

require("dotenv").config();

// Load Near Javascript API components
const near = require("near-api-js");
const fs = require("fs");

// Configure the directory where NEAR credentials are going to be stored
const credentialsPath = "./credentials";

// Configure the keyStore to be used with the NEAR Javascript API
const UnencryptedFileSystemKeyStore = near.keyStores.UnencryptedFileSystemKeyStore;
const keyStore = new UnencryptedFileSystemKeyStore(credentialsPath);

export class NearUtil {

    static async createAccount(username, accountId, hostname) {
        try {
            let keyPair;
            // Setup default client options
            const options = {
                networkId: 'testnet',
                nodeUrl: 'https://rpc.testnet.near.org',
                walletUrl: `https://wallet.testnet.near.org`,
                helperUrl: `https://helper.testnet.near.org`,
                explorerUrl: `https://explorer.testnet.near.org`,
                accountId: accountId,
                keyStore: keyStore
            };
            // Configure the client with options and our local key store
            const client = await near.connect(options);
            // Configure the key pair file location
            const keyRootPath = client.connection.signer.keyStore.keyDir;
            const keyFilePath = `${keyRootPath}/${options.networkId}/${accountId}.json`;
            // Check if the key pair exists, and create a new one if it does not
            if (!fs.existsSync(keyFilePath)) {
                console.log("Generating a new key pair")
                keyPair = near.KeyPair.fromRandom("ed25519");
            } else {
                throw new AccountAlreadyExistsException();
            }
            // Create a key pair in credentials directory
            await client.connection.signer.keyStore.setKey(options.networkId, options.accountId, keyPair);
            // Generate a public key for account creation step
            const publicKey = keyPair.getPublicKey()
            console.log(publicKey)
            // Create the account
            console.log("Creating a new account")
            const response = await client.createAccount(accountId, publicKey);
            console.log(`Account ${accountId} for network "${options.networkId}" was created.`);
            console.log("----------------------------------------------------------------");
            console.log("OPEN LINK BELOW to see account in NEAR Explorer!");
            console.log(`${options.explorerUrl}/accounts/${accountId}`);
            let content = JSON.parse(fs.readFileSync(keyFilePath).toString());
            const updateResponse = await UserUtil.updateUserSecurity(username, accountId, content.public_key, content.private_key, hostname);
            console.log(`Account ${accountId} public_key is "${content.public_key}".`);
            console.log(`Account ${accountId} public_key is "${content.private_key}".`);
            if (updateResponse.infoCode != 10000) {
                throw new AccountAlreadyExistsException();
            }
            console.log(`Key pair for account ${accountId} save success`);
            console.log("----------------------------------------------------------------");
            return response;
        } catch (error) {
            console.log(error)
            throw new AccountAlreadyExistsException();
        }
    }

    static async mint(to, tokenId) {
        try {
            // Setup default client options
            const options = {
                networkId: 'testnet',
                nodeUrl: 'https://rpc.testnet.near.org',
                walletUrl: `https://wallet.testnet.near.org`,
                helperUrl: `https://helper.testnet.near.org`,
                explorerUrl: `https://explorer.testnet.near.org`,
                accountId: 'imm',
                keyStore: keyStore
            };
            // Configure the client with options and our local key store
            const client = await near.connect(options);
            const account = await client.account(options.accountId);
            // We'are using the same contract name, feel free to create a different one.
            const contractName = options.accountId;
            // Construct a new contract object, we'll be using it to perform calls
            const contract = new near.Contract(account, contractName, {
                viewMethods: [],
                changeMethods: ["mint_token", "transfer"], // our write function
                sender: options.accountId,   // account used to sign contract call transactions
            });
            console.log(`Calling contract call 'mint_token' with '${tokenId}'`);
            console.log(await contract.mint_token({owner_id: options.accountId, token_id: tokenId}));
            console.log(`Calling contract call 'transfer' with '${tokenId}'`);
            return await contract.transfer({new_owner_id: to, token_id: tokenId});
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async transfer(fromAccount, tokenId, to) {
        try {
            // Setup default client options
            const options = {
                networkId: 'testnet',
                nodeUrl: 'https://rpc.testnet.near.org',
                walletUrl: `https://wallet.testnet.near.org`,
                helperUrl: `https://helper.testnet.near.org`,
                explorerUrl: `https://explorer.testnet.near.org`,
                accountId: fromAccount,
                contractName: 'imm',
                keyStore: keyStore
            };
            // Configure the client with options and our local key store
            const client = await near.connect(options);
            const account = await client.account(options.accountId);
            const contractName = options.contractName;
            // Construct a new contract object, we'll be using it to perform calls
            const contract = new near.Contract(account, contractName, {
                viewMethods: [],
                changeMethods: ["transfer"], // our write function
                sender: options.accountId,   // account used to sign contract call transactions
            });
            console.log(`Calling contract call 'transfer' with '${tokenId}'`);
            return await contract.transfer({new_owner_id: to, token_id: tokenId});
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
