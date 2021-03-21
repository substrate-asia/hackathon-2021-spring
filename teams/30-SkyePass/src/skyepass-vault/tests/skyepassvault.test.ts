import BN from 'bn.js';
import { expect } from 'chai';
import { patract, network, artifacts } from 'redspot';
import { DB, IPFS, Metadata } from '../client/index'
import path from 'path'
import fs from 'fs'
import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import crypto from 'eth-crypto'
const { u8aToHex } = require('@polkadot/util');


const { getContractFactory, getRandomSigner } = patract;

const { api, getSigners, keyring } = network;

const testVault = "QmPvNDeFhpN5WxLmnQ7f2WS7si3CtF1qr5VorDg6E1EL2A"

// End to End run through
describe('End to End run through', () => {
  after(() => {
    return api.disconnect();
  });

  async function setup() {
    const one = new BN(10).pow(new BN(api.registry.chainDecimals[0]));
    const signers = await getSigners();
    const Alice = signers[0];
    const deployer = await getRandomSigner(Alice, one.muln(20000));
    const contractFactory = await getContractFactory('skyepassvault', deployer);
    const contract = await contractFactory.deploy('new');

    const abi = artifacts.readArtifact('skyepassvault');

    return { contractFactory, contract, abi, Alice, one, deployer };
  }

  it('runs end to end well', async () => {
    const { one, contract, deployer } = await setup()
    const dbPath = path.resolve(__dirname + '/../client/passwords.json')

    const sender1 = await getRandomSigner(deployer, one.muln(10))
    const sender2 = await getRandomSigner(deployer, one.muln(10))
    const sender3 = await getRandomSigner(deployer, one.muln(10))


    const privateKey1 = mnemonicToMiniSecret(sender1.pair.suri)
    const keys1 = {
      privateKey: u8aToHex(privateKey1),
      publicKey: crypto.publicKeyByPrivateKey(u8aToHex(privateKey1))
    }
    const privateKey2 = mnemonicToMiniSecret(sender2.pair.suri)
    const keys2 = {
      privateKey: u8aToHex(privateKey2),
      publicKey: crypto.publicKeyByPrivateKey(u8aToHex(privateKey2))
    }
    const privateKey3 = mnemonicToMiniSecret(sender3.pair.suri)
    const keys3 = {
      privateKey: u8aToHex(privateKey3),
      publicKey: crypto.publicKeyByPrivateKey(u8aToHex(privateKey3))
    }

    // SENDER1's Local Environment 
    const db = new DB(dbPath)
    const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

    // private Schema
    let encryptionSchema = {
      pieces: 2, quorum: 2,
      publicPieceCount: 1,
      owner: keys1.publicKey,
      members: []
    }

    const metadata = new Metadata(encryptionSchema, ipfs, db)

    db.addItem('password.skye.kiwi', { name: "Github", account: "something", password: "asdfasdf", OTP: "HJKHJKHJK" })
    db.addItem('password.skye.kiwi', { name: "Twitter", account: "something", password: "asdfasdf", OTP: "HJKHJKHJK" })

    const { cid } = await metadata.buildMetadata()

    // sender1 creates a vault
    await expect(contract.tx.createVault(cid, { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)
    expect((await contract.query.ownerOf(0)).output).to.equal(sender1.address)

    // // sender1 fetch a vault
    // // TODO: validate nounce ... 
    let vault_cid = (await contract.query.getMetadata(0)).output
    let result = JSON.parse(await ipfs.cat(vault_cid?.toString()))
    let recovered = await metadata.recover(result, keys1.publicKey, keys1.privateKey)
    let local = metadata.db.toJson()
    
    delete recovered.package.last_cid
    delete local.package.last_cid
    expect(JSON.stringify(recovered)).to.equal(JSON.stringify(local))

    // sender 1 share the vault with sender2 and sender3
    encryptionSchema = {
      pieces: 4, quorum: 2,
      publicPieceCount: 1,
      owner: keys1.publicKey,
      members: [keys2.publicKey, keys3.publicKey]
    }

    // sender1 can add sender2 and sender3 to the shared list 
    await expect(contract.tx.nominateMember(0, sender2.address, {signer: sender1}))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender2.address)

    await expect(contract.tx.nominateMember(0, sender3.address, { signer: sender1 }))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender3.address)
    
    const new_result = await metadata.buildMetadata()
    await expect(contract.tx.updateMetadata(0, new_result.cid, {signer: sender1}))
      .to.emit(contract, 'VaultUpdate')
      .withArgs(0, sender1.address)

    // Now sender 2 can fetch and read the vault
    vault_cid = (await contract.query.getMetadata(0, {signer: sender2})).output
    result = JSON.parse(await ipfs.cat(vault_cid?.toString()))
    
    recovered = await metadata.recover(result, keys1.publicKey, keys1.privateKey)
    local = metadata.db.toJson()

    delete recovered.package.last_cid
    delete local.package.last_cid
    
    // since we have made no change to the DB, it should match what sender1 has locally
    expect(JSON.stringify(recovered)).to.equal(JSON.stringify(local))

    // Now sender2 can update the vault 
    db.addItem('password.skye.kiwi', { name: "Github", account: "something", password: "asdfasdf", OTP: "HJKHJKHJK" })
    db.addItem('password.skye.kiwi', { name: "Twitter", account: "something", password: "asdfasdf", OTP: "HJKHJKHJK" })

    const updated_result = await metadata.buildMetadata()

    await expect(contract.tx.updateMetadata(0, updated_result.cid, { signer: sender2 }))
      .to.emit(contract, 'VaultUpdate')
      .withArgs(0, sender2.address)

    // Now sender 1 can fetch and read the vault
    vault_cid = (await contract.query.getMetadata(0, { signer: sender1 })).output
    result = JSON.parse(await ipfs.cat(vault_cid?.toString()))

    recovered = await metadata.recover(result, keys1.publicKey, keys1.privateKey)
    local = metadata.db.toJson()

    delete recovered.package.last_cid
    delete local.package.last_cid

    // this is not a perfect test .. because sender1 and sender2 are reading 
    // the same local vault, but they should match. In a real world senario, 
    // the newly fetched vault will be tested by nounce for error, if things 
    // are looking good, it should replace the local vault
    expect(JSON.stringify(recovered)).to.equal(JSON.stringify(local))
  })
})

// Smart Contract
describe('SkyePassVault Smart Contract', () => {
  after(() => {
    return api.disconnect();
  });

  async function setup() {
    const one = new BN(10).pow(new BN(api.registry.chainDecimals[0]));
    const signers = await getSigners();
    const Alice = signers[0];

    const sender1 = await getRandomSigner(Alice, one.muln(10000));
    const sender2 = await getRandomSigner(Alice, one.muln(10000));
    const sender3 = await getRandomSigner(Alice, one.muln(10000));
    const sender4 = await getRandomSigner(Alice, one.muln(10000));

    const contractFactory = await getContractFactory('skyepassvault', sender1);
    const contract = await contractFactory.deploy('new');

    const abi = artifacts.readArtifact('skyepassvault');
    const receiver = await getRandomSigner();

    return { sender1, sender2, sender3, sender4, contractFactory, contract, abi, receiver, Alice, one };
  }

  // basic functionalities
  it('creates a new vault & assign caller as owner', async () => {
    const {contract, sender1} = await setup();

    expect((await contract.query.authorizeOwner(0, sender1.address)).output).to.equal(false)
    
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)
    
    const owner = await contract.query.ownerOf(0)
    expect(owner.output).to.equal(sender1.address)    
    expect((await contract.query.authorizeOwner(0, sender1.address)).output).to.equal(true)
  })

  it('adds a member to a vault & remove a member to a vault', async () => {
    const {contract, sender1, sender2} = await setup();

    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)
    
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender2.address, { signer: sender1}))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender2.address)

    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)
    
    await expect(contract.tx.removeMember(0, sender2.address, { signer: sender1}))
      .to.emit(contract, "MembershipRevoked")
      .withArgs(0, sender1.address, sender2.address)
    
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
  })

  it('queries & updates a metadata of a vault', async () => {
    const { contract, sender1, sender2 } = await setup();
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)    
    
    expect((await contract.query.getMetadata(0)).output).to.equal(JSON.stringify(testVault))

    await expect(contract.tx.updateMetadata(0, "123", {signer: sender1}))
      .to.emit(contract, 'VaultUpdate')
      .withArgs(0, sender1.address)

    expect((await contract.query.getMetadata(0)).output).to.equal("123")
  })

  it('deletes a vault', async () => {
    const { contract, sender1 } = await setup();
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)    
    
    expect((await contract.query.getMetadata(0)).output).to.equal(JSON.stringify(testVault))
    expect((await contract.query.authorizeOwner(0, sender1.address)).output).to.equal(true)

    await expect(contract.tx.burnVault(0, { signer: sender1 }))
      .to.emit(contract, 'VaultBurnt')
      .withArgs(0, sender1.address)

    expect((await contract.query.getMetadata(0)).output?.toHuman()).to.be.oneOf([null, false])
    expect((await contract.query.authorizeOwner(0, sender1.address)).output?.toHuman()).to.be.oneOf([null, false])

  })

  // authorizations 
  it('only allows members or owner to update metadata', async() => {
    const { contract, sender1, sender2, sender3 } = await setup();
    
    // sender1 creates a vault
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)

    expect((await contract.query.getMetadata(0)).output).to.equal(JSON.stringify(testVault))
    
    // sender1 can update the metadata
    await expect(contract.tx.updateMetadata(0, "123", { signer: sender1 }))
      .to.emit(contract, 'VaultUpdate')
      .withArgs(0, sender1.address)    
    expect((await contract.query.getMetadata(0)).output).to.equal("123")

    // sender1 nominated sender2 to be a member
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender2.address, { signer: sender1 }))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender2.address)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)

    // sender2 & sender 1 can update the metadata, while sender3 cannot
    expect((await contract.query.getMetadata(0)).output).to.equal("123")
    
    await expect(contract.tx.updateMetadata(0, "456", { signer: sender1 }))
      .to.emit(contract, 'VaultUpdate')
      .withArgs(0, sender1.address)  
    expect((await contract.query.getMetadata(0)).output).to.equal("456")

    expect((await contract.query.getMetadata(0)).output).to.equal("456")
    await expect(contract.tx.updateMetadata(0, "789", { signer: sender2 }))
      .to.emit(contract, 'VaultUpdate')
      .withArgs(0, sender2.address)
    
    expect((await contract.query.getMetadata(0)).output).to.equal("789")

    expect((await contract.query.getMetadata(0)).output).to.equal("789")

    await expect(contract.tx.updateMetadata(0, "abc", { signer: sender3 }))
      .to.not.emit(contract, 'VaultUpdate')
    
    expect((await contract.query.getMetadata(0)).output).to.equal("789")
  })

  it('only allows owner to nominate or remove members', async () => {
    const { contract, sender1, sender2, sender3, sender4 } = await setup();

    // sender1 creates a vault
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)

    expect((await contract.query.getMetadata(0)).output).to.equal(JSON.stringify(testVault))

    // sender1 nominated sender2 to be a member
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender2.address, { signer: sender1 }))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender2.address)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)

    // sender 2 cannot nominate another member
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender3.address, { signer: sender2 }))
      .to.not.emit(contract, "MemembershipGranted")
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(false)

    // others cannot nominate other members
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender4.address, { signer: sender3}))
      .to.not.emit(contract, "MemembershipGranted")
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(false)
    expect((await contract.query.authorizeMember(0, sender4.address)).output).to.equal(false)
  })

  it('only allows owner to remove members', async () => {
    const { contract, sender1, sender2, sender3, sender4 } = await setup();

    // sender1 creates a vault
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)

    expect((await contract.query.getMetadata(0)).output).to.equal(JSON.stringify(testVault))

    // sender1 nominated sender2 to be a member
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender2.address, { signer: sender1 }))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender2.address)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)

    // sender1 nominated sender3 to be a member
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender3.address, { signer: sender1 }))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender3.address)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(true)

    // sender 2 cannot remove sender3 as a member
    expect((await contract.query.authorizeOwner(0, sender2.address)).output).to.equal(false)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(true)
    await expect(contract.tx.removeMember(0, sender3.address, { signer: sender2 }))
      .to.not.emit(contract, "MembershipRevoked")
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(true)

    // others cannot remove members
    expect((await contract.query.authorizeOwner(0, sender2.address)).output).to.equal(false)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender4.address)).output).to.equal(false)
    await expect(contract.tx.removeMember(0, sender3.address, { signer: sender4 }))
      .to.not.emit(contract, "MembershipRevoked")
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(true)

    // sender1 can remove members
    expect((await contract.query.authorizeOwner(0, sender1.address)).output).to.equal(true)
    expect((await contract.query.authorizeOwner(0, sender2.address)).output).to.equal(false)
    expect((await contract.query.authorizeOwner(0, sender3.address)).output).to.equal(false)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(true)
    await expect(contract.tx.removeMember(0, sender2.address, { signer: sender1 }))
      .to.emit(contract, "MembershipRevoked")
      .withArgs(0, sender1.address, sender2.address)
    await expect(contract.tx.removeMember(0, sender3.address, { signer: sender1 }))
      .to.emit(contract, "MembershipRevoked")
      .withArgs(0, sender1.address, sender3.address)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(false)
  })

  it('only allows members or owner to change to their own vault', async () => {
    const { contract, sender1, sender2, sender3, sender4 } = await setup();

    // sender1 creates a vault & sender2 creates another vault
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)

    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender2 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(1, sender2.address)

    expect((await contract.query.ownerOf(0)).output).to.equal(sender1.address)
    expect((await contract.query.ownerOf(1)).output).to.equal(sender2.address)

    // sender1 cannot touch another vault
    expect((await contract.query.authorizeMember(1, sender1.address)).output).to.equal(false)
    expect((await contract.query.authorizeOwner(1, sender1.address)).output).to.equal(false)

    // sender2 cannot touch another vault
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
    expect((await contract.query.authorizeOwner(0, sender2.address)).output).to.equal(false)
  })

  it('only allows owner to burn vaults', async () => {
    const { contract, sender1, sender2, sender3 } = await setup();

    // sender1 creates a vault
    await expect(contract.tx.createVault(JSON.stringify(testVault), { signer: sender1 }))
      .to.emit(contract, 'VaultCreation')
      .withArgs(0, sender1.address)

    expect((await contract.query.ownerOf(0)).output).to.equal(sender1.address)

    // sender1 nominated sender2 to be a member
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(false)
    await expect(contract.tx.nominateMember(0, sender2.address, { signer: sender1 }))
      .to.emit(contract, "MemembershipGranted")
      .withArgs(0, sender1.address, sender2.address)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)

    // sender 1 can burn a vault, while sender2 or others cannot
    expect((await contract.query.authorizeOwner(0, sender1.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender2.address)).output).to.equal(true)
    expect((await contract.query.authorizeMember(0, sender3.address)).output).to.equal(false)

    await expect(contract.tx.burnVault(0, { signer: sender2}))
      .to.not.emit(contract, "VaultBurnt")
    await expect(contract.tx.burnVault(0, { signer: sender3 }))
      .to.not.emit(contract, "VaultBurnt")
    await expect(contract.tx.burnVault(0, { signer: sender1 }))
      .to.emit(contract, 'VaultBurnt')
      .withArgs(0, sender1.address)
  })
})

// DB Functions
describe('DB Adapter', () => {
	const filePath = path.resolve(__dirname + '/../client/passwords.json')

	const emptyJSONFile = () => {fs.writeFileSync(filePath, '{}')}

	const onlyUnique = (value, index, self) => {
		return self.indexOf(value) === index;
	}

	const password1 = { name: "github", account: "something", password: "asdfasdf", OTP: "HJKHJKHJK" }
	const password2 = { name: "twitter", account: "something", password: "asdfasdf", OTP: "HJKHJKHJK" }
	const note1 = { title: "title 1", content: "sjlkdfjlkasjflkjasdklfja" }
	const note2 = { title: "title 2", content: "u877897897897897897897897897" }

	const appId1 = 'some.app.skye.kiwi'
	const appMetadata = {
		name: "some app",
		developer: "SkyeKiwi",
		desc: "asjdfkljasdklfjklasdjfkljskd"
	}
	const appData1 = { privateKeys: ['asdfasdfadsf', 'asdfasdfasdfdasfasdfaf'] }

  it('add item & read item', () => {
		emptyJSONFile()
		const db = new DB(filePath)

		db.addItem('password.skye.kiwi', password1)
		db.addItem('password.skye.kiwi', password2)
		db.addItem('note.skye.kiwi', note1)
		db.addItem('note.skye.kiwi', note2)

		// passwords
		const passwords = db.readItems('password.skye.kiwi')
		expect(passwords.length).to.equal(2)

		let uuids = []
		uuids.push(passwords[0].uuid)
		uuids.push(passwords[1].uuid)
		delete passwords[0].uuid
		delete passwords[1].uuid

		expect(passwords[0]).to.deep.equal(password1)
		expect(passwords[1]).to.deep.equal(password2)
		expect(uuids.filter(onlyUnique).length).to.equal(2)

		//  notes
		const notes = db.readItems('note.skye.kiwi')
		expect(notes.length).to.equal(2)

		uuids = []
		uuids.push(notes[0].uuid)
		uuids.push(notes[1].uuid)
		delete notes[0].uuid
		delete notes[1].uuid

		expect(notes[0]).to.deep.equal(note1)
		expect(notes[1]).to.deep.equal(note2)
		expect(uuids.filter(onlyUnique).length).to.equal(2)
	})

	it('install new apps', () => {
		emptyJSONFile()
		const db = new DB(filePath)

		db.installApp(appId1, appMetadata)
		const x = db.getMetadata()
		expect(x.installed).to.contains(appId1)
		expect(x[appId1]).to.equal(appMetadata)

		db.addItem(appId1, appData1)
		const y = db.readItems(appId1)
		expect(y.length).to.equal(1)
		expect(y[0]).to.equal(appData1)
	})

	it('updates an object', () => {
		emptyJSONFile()
		const db = new DB(filePath)

		db.addItem('password.skye.kiwi', password1)
		db.addItem('password.skye.kiwi', password2)
		const passwords = db.readItems('password.skye.kiwi')

		const pre_updated_data_str = JSON.stringify(passwords[0])
		const update_item_uuid = passwords[0].uuid
		passwords[0].name = "UPDATED"

		db.updateItem('password.skye.kiwi', update_item_uuid, passwords[0])

		const passwords_changed = db.readItems('password.skye.kiwi')
		expect(passwords_changed.length).to.equal(2)

		const pre_updated_data = JSON.parse(pre_updated_data_str)

		if (passwords_changed[0].uuid == update_item_uuid) {
			expect(passwords_changed[0].name).to.equal('UPDATED')
			passwords_changed[0].name = pre_updated_data.name
			expect(passwords_changed[0]).to.deep.equal(pre_updated_data)
		} else {
			expect(passwords_changed[1].name).to.equal('UPDATED')
			passwords_changed[1].name = pre_updated_data.name
			expect(passwords_changed[1]).to.deep.equal(pre_updated_data)
		}
	})

	it('deletes an object', () => {
		emptyJSONFile()
		const db = new DB(filePath)

		db.addItem('password.skye.kiwi', password1)
		db.addItem('password.skye.kiwi', password2)
		const passwords = db.readItems('password.skye.kiwi')
		expect(passwords.length).to.equal(2)

		db.deleteItem('password.skye.kiwi',passwords[0].uuid)
		const passwords_updated = db.readItems('password.skye.kiwi')
		expect(passwords_updated.length).to.equal(1)
		expect(passwords_updated[0]).to.deep.equal(password2)
	})
})

// // IPFS 
describe('IPFS Adapter', () => {
	const ipfs = new IPFS({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https'
	})

	const testString = "abcdejkjlkasdjfklajskldfjlkasjdklfjklsdjfklasjdlkfj"

	it('uploads some content to IPFS', async() => {
		const result = await ipfs.add(testString)
	})

	it('fetch content by CID on IPFS', async() => {
		const result = await ipfs.add(testString)
		const content = await ipfs.cat(result.cid)
		expect(content).to.equal(testString)
	})

	it('pins a CID on Infura IPFS', async () => {
		const result = await ipfs.add(testString)
		await ipfs.cat(result.cid)
		await ipfs.pin(result.cid)
	})
})

// // Encryption & Metadata
describe('Encrytion & Metadata', () => {
	const dbPath = path.resolve(__dirname + '/../client/passwords.json')
	const emptyJSONFile = () => {fs.writeFileSync(dbPath, '{}')}
	emptyJSONFile()


  // we are using eth-crypto here for the simplest keypair generation
  // because it does not really matter. We just need some typical keypairs
	const acct1 = crypto.createIdentity()
	const acct2 = crypto.createIdentity()
	const acct3 = crypto.createIdentity()

	const keys1 = {
		privateKey: acct1.privateKey,
		publicKey: acct1.publicKey
	}

	const keys2 = {
		privateKey: acct2.privateKey,
		publicKey: acct2.publicKey
	}

	const keys3 = {
		privateKey: acct3.privateKey,
		publicKey: acct3.publicKey
	}

	const encryptionSchema = {
		pieces: 4, quorum: 2,
		publicPieceCount: 1,
		owner: keys1.publicKey,
		members: [keys2.publicKey, keys3.publicKey]
	}

	const metadata = new Metadata(encryptionSchema, 
    new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'}), 
    new DB(dbPath))

	it('encrypts and decrypts', async() => {
		const msg = "some secret"

		const encrypted = await Metadata.encrypt(keys1.publicKey, msg)
		const decrypted = await Metadata.decrypt(keys1.privateKey, encrypted)

		expect(decrypted).to.equal(msg)
	})

	it('generate, upload metadata & recover from metadata with a privatekey', async() => {

		// IPFS Nounce pre-updating
		const nounce_ipfs = await metadata.getIPFSMetadataNounce()
		expect(nounce_ipfs).to.equal(0)

		// local DB pre-updating
		let dbObj = JSON.parse((await fs.readFileSync(dbPath)).toString())
		expect(dbObj.package.nounce).to.equal(0)

		// post-updating CID & Nounce
		let {cid, result} = await metadata.buildMetadata()
		let recovered = await metadata.recover(result, keys1.publicKey, keys1.privateKey)

		expect(recovered.package.nounce).to.equal(1)
		expect(recovered.package.last_cid).to.equal("")

		dbObj = JSON.parse((await fs.readFileSync(dbPath)).toString())
		expect(dbObj.package.nounce).to.equal(1)
		expect(dbObj.package.last_cid).to.equal(cid)


		// change the DB by adding a password
		const password1 = { name: "github", account: "something", password: "asdfasdf", OTP: "HJKHJKHJK" }
		await metadata.db.addItem('password.skye.kiwi', password1)

		// post-updating new (CID & Nounce)
		const x = await metadata.buildMetadata()

		const new_cid = x.cid
		const new_result = x.result

		recovered = await metadata.recover(new_result, keys1.publicKey, keys1.privateKey)

		expect(recovered.package.nounce).to.equal(2)
		expect(recovered.package.last_cid).to.equal(cid)

		dbObj = JSON.parse((await fs.readFileSync(dbPath)).toString())
		expect(dbObj.package.nounce).to.equal(2)
		expect(dbObj.package.last_cid).to.equal(new_cid)
	})
})
