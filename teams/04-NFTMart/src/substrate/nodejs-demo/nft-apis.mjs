import {getApi, getModules, waitTx, hexToUtf8} from "./utils.mjs";
import {Keyring} from "@polkadot/api";
import {bnToBn} from "@polkadot/util";
import {Command} from "commander";

const unit = bnToBn('1000000000000');

async function showNft(api, classID, tokenID) {
	let nft = await api.query.ormlNft.tokens(classID, tokenID);
	if (nft.isSome) {
		nft = nft.unwrap();
		console.log(nft.toString());
	}
}

async function nftDeposit(api, metadata, nft_quantity) {
	try {
		let [_deposit, depositAll] = await api.ws.call('nftmart_mintTokenDeposit', [metadata.length, nft_quantity.toNumber()], 10000);
		return bnToBn(depositAll);
	} catch (e) {
		console.log(e);
		return null;
	}
}

async function classDeposit(api, metadata, name, description) {
	try {
		let [_deposit, depositAll] = await api.ws.call('nftmart_createClassDeposit', [metadata.length, name.length, description.length], 10000);
		return bnToBn(depositAll);
	} catch (e) {
		console.log(e);
		return null;
	}
}

async function proxyDeposit(api, num_proxies) {
	try {
		let deposit = await api.ws.call('nftmart_addClassAdminDeposit', [num_proxies], 10000);
		return bnToBn(deposit);
	} catch (e) {
		console.log(e);
		return null;
	}
}

async function main() {
	const ss58Format = 50;
	const keyring = new Keyring({type: 'sr25519', ss58Format});
	const program = new Command();
	program.command('create-class <account>').action(async (account) => {
		await demo_create_class(keyring, account);
	});
	program.command('show-class-info').action(async () => {
		await demo_show_class_info();
	});
	program.command('add-class-admin <account>').action(async (account) => {
		await demo_add_class_admin(keyring, account);
	});
	program.command('mint-nft <account> <classID>').action(async (account, classID) => {
		await demo_mint_nft(keyring, account, classID);
	});
	program.command('show-all-nfts [classID]').action(async (classID) => {
		await demo_show_all_nfts(classID);
	});
	program.command('query-nft <account>').action(async (account) => {
		await demo_query_nft(keyring, account);
	});
	program.command('query-class <account>').action(async (account) => {
		await demo_query_class(keyring, account);
	});
	program.command('transfer-nft <classID> <tokenID> <from> <to>').action(async (classID, tokenID, from, to) => {
		await demo_transfer_nft(keyring, classID, tokenID, from, to);
	});
	program.command('burn-nft <classID> <tokenID> <account>').action(async (classID, tokenID, account) => {
		await demo_burn_nft(keyring, classID, tokenID, account);
	});
	program.command('destroy-class <classID> <account>').action(async (classID, account) => {
		await demo_destroy_class(keyring, classID, account);
	});
	program.command('show-create-class-deposit <metadata> <name> <description>').action(async (metadata, name, description) => {
		await demo_show_create_class_deposit(metadata, name, description);
	});
	program.command('create-category <metadata> <account>').action(async (metadata, account) => {
		await demo_create_category(keyring, metadata, account);
	});
	program.command('show-categories').action(async () => {
		await demo_show_categories();
	});
	program.command('show-orders').action(async () => {
		await demo_show_orders(keyring);
	});
	program.command('create-order <classID> <tokenID> <account>').action(async (classID, tokenID, account) => {
		await demo_create_order(keyring, classID, tokenID, account);
	});
	program.command('take-order <classID> <tokenID> <orderOwner> <account>').action(async (classID, tokenID, orderOwner, account) => {
		await demo_take_order(keyring, classID, tokenID, orderOwner, account);
	});
	program.parse();
}

async function demo_take_order(keyring, classID, tokenID, orderOwner, account) {
	let api = await getApi();
	let moduleMetadata = await getModules(api);
	account = keyring.addFromUri(account);
	orderOwner = keyring.addFromUri(orderOwner).address;
	let order = await api.query.nftmart.orders([classID, tokenID], orderOwner);
	if(order.isSome){
		order = order.unwrap();
		const call =  api.tx.nftmart.takeOrder(classID, tokenID, order.price, orderOwner);
		const feeInfo = await call.paymentInfo(account);
		console.log("The fee of the call: %s.", feeInfo.partialFee / unit);
		let [a, b] = waitTx(moduleMetadata);
		await call.signAndSend(account, a);
		await b();
	}
	process.exit();
}

const NativeCurrencyID = 0;

async function demo_create_order(keyring, classID, tokenID, account) {
	let api = await getApi();
	let moduleMetadata = await getModules(api);
	account = keyring.addFromUri(account);
	const price = unit.mul(bnToBn('20'));
	const deposit = unit.mul(bnToBn('5'));
	const categoryId = 0;
	const currentBlockNumber = bnToBn(await api.query.system.number());

	const call = api.tx.nftmart.submitOrder(
		NativeCurrencyID,
		price,
		categoryId,
		classID, tokenID,
		deposit,
		currentBlockNumber.add(bnToBn('1000')),
	);
	const feeInfo = await call.paymentInfo(account);
	console.log("The fee of the call: %s.", feeInfo.partialFee / unit);
	let [a, b] = waitTx(moduleMetadata);
	await call.signAndSend(account, a);
	await b();
	process.exit();
}

async function demo_show_orders(keyring) {
	let api = await getApi();
	let orderCount = 0;
	const allOrders = await api.query.nftmart.orders.entries();
	for (let order of allOrders) {
		let key = order[0];
		let keyLen = key.length;
		const orderOwner = keyring.encodeAddress(new Uint8Array(key.buffer.slice(keyLen - 32, keyLen)));

		const classID = new Uint32Array(key.slice(keyLen - 4 - 8 - 32 - 16, keyLen - 8 - 32 - 16))[0];
		const tokenIDRaw = new Uint32Array(key.slice(keyLen - 8 - 32 - 16, keyLen - 32 - 16));

		const tokenIDLow32 = tokenIDRaw[0];
		const tokenIDHigh32 = tokenIDRaw[1];
		const tokenID = u32ToU64(tokenIDLow32, tokenIDHigh32);

		let nft = await api.query.ormlNft.tokens(classID, tokenID);
		if (nft.isSome) {
			nft = nft.unwrap();
		}

		let data = order[1].toHuman();
		data.orderOwner = orderOwner;
		data.classID = classID;
		data.tokenID = tokenID;
		data.nft = nft;
		console.log("%s", JSON.stringify(data));
		orderCount++;
	}
	console.log(`orderCount is ${orderCount}.`);
	process.exit();
}

async function demo_show_categories() {
	let api = await getApi();
	let cateCount = 0;
	const callCategories = await api.query.nftmart.categories.entries();
	for (let category of callCategories) {
		let key = category[0];
		const data = category[1].unwrap();
		const len = key.length;
		key = key.buffer.slice(len - 4, len);
		const cateId = new Uint32Array(key)[0];
		console.log(cateId, data.toHuman());
		cateCount++;
	}
	const nextCategoryId = await api.query.nftmart.nextCategoryId();
	console.log(`nextCategoryId is ${nextCategoryId}.`);
	console.log(`cateCount is ${cateCount}.`);
	process.exit();
}

async function demo_create_category(keyring, metadata, account) {
	let api = await getApi();
	let moduleMetadata = await getModules(api);
	account = keyring.addFromUri(account);
	const call = api.tx.sudo.sudo(api.tx.nftmart.createCategory(metadata));
	const feeInfo = await call.paymentInfo(account);
	console.log("The fee of the call: %s.", feeInfo.partialFee / unit);
	let [a, b] = waitTx(moduleMetadata);
	await call.signAndSend(account, a);
	await b();
	process.exit();
}

async function demo_show_create_class_deposit(metadata, name, description) {
	let api = await getApi();
	const deposit = await classDeposit(api, metadata, name, description);
	console.log(deposit.toString());
	process.exit(0);
}

async function demo_destroy_class(keyring, classID, account) {
	let api = await getApi();
	let moduleMetadata = await getModules(api);
	account = keyring.addFromUri(account);
	let classInfo = await api.query.ormlNft.classes(classID);
	if (classInfo.isSome) {
		classInfo = classInfo.unwrap();
		const call = api.tx.proxy.proxy(classInfo.owner, null, api.tx.nftmart.destroyClass(classID, account.address));
		const feeInfo = await call.paymentInfo(account);
		console.log("The fee of the call: %s.", feeInfo.partialFee / unit);
		let [a, b] = waitTx(moduleMetadata);
		await call.signAndSend(account, a);
		await b();
	}
	process.exit();
}

async function demo_burn_nft(keyring, classID, tokenID, account) {
	let api = await getApi();
	await showNft(api, classID, tokenID);

	let moduleMetadata = await getModules(api);
	account = keyring.addFromUri(account);

	const call = api.tx.nftmart.burn(classID, tokenID);
	const feeInfo = await call.paymentInfo(account);
	console.log("The fee of the call: %s.", feeInfo.partialFee / unit);
	let [a, b] = waitTx(moduleMetadata);
	await call.signAndSend(account, a);
	await b();

	await showNft(api, classID, tokenID);
	process.exit();
}

async function demo_transfer_nft(keyring, classID, tokenID, from, to) {
	let api = await getApi();
	await showNft(api, classID, tokenID);

	let moduleMetadata = await getModules(api);
	from = keyring.addFromUri(from);
	to = keyring.addFromUri(to).address;

	const call = api.tx.nftmart.transfer(to, classID, tokenID);
	const feeInfo = await call.paymentInfo(from);
	console.log("The fee of the call: %s.", feeInfo.partialFee / unit);

	let [a, b] = waitTx(moduleMetadata);
	await call.signAndSend(from, a);
	await b();

	await showNft(api, classID, tokenID);
	process.exit();
}

async function demo_query_class(keyring, account) {
	let api = await getApi();
	const address = keyring.addFromUri(account).address;
	const allClasses = await api.query.ormlNft.classes.entries();
	for (const c of allClasses) {
		let key = c[0];
		const len = key.length;
		key = key.buffer.slice(len - 4, len);
		const classID = new Uint32Array(key)[0];
		let clazz = c[1].toJSON();
		clazz.metadata = hexToUtf8(clazz.metadata.slice(2));
		clazz.classID = classID;
		clazz.adminList = await api.query.proxy.proxies(clazz.owner);
		for (const a of clazz.adminList[0]) {
			if (a.delegate.toString() === address) {
				console.log("%s", JSON.stringify(clazz));
			}
		}
	}
	process.exit();
}

function u32ToU64(tokenIDLow32, tokenIDHigh32) {
	// TODO: convert [tokenIDLow32, tokenIDHigh32] into Uint64.
	return tokenIDLow32;
}

async function demo_query_nft(keyring, account) {
	let api = await getApi();
	const address = keyring.addFromUri(account).address;
	const nfts = await api.query.ormlNft.tokensByOwner.entries(address);
	for (let clzToken of nfts) {
		clzToken = clzToken[0];
		const len = clzToken.length;

		const classID = new Uint32Array(clzToken.slice(len - 4 - 8, len - 8))[0];
		const tokenIDRaw = new Uint32Array(clzToken.slice(len - 8, len));

		const tokenIDLow32 = tokenIDRaw[0];
		const tokenIDHigh32 = tokenIDRaw[1];
		const tokenID = u32ToU64(tokenIDLow32, tokenIDHigh32);

		let nft = await api.query.ormlNft.tokens(classID, tokenID);
		if (nft.isSome) {
			nft = nft.unwrap();
			console.log(`${classID} ${tokenID} ${nft.toString()}`);
		}
	}
	process.exit();
}

async function show_all_nfts(api, classID) {
	const nextTokenId = await api.query.ormlNft.nextTokenId(classID);
	console.log(`nextTokenId is ${nextTokenId}.`);
	let tokenCount = 0;
	let classInfo = await api.query.ormlNft.classes(classID);
	if (classInfo.isSome) {
		classInfo = classInfo.unwrap();
		const accountInfo = await api.query.system.account(classInfo.owner);
		console.log(classInfo.toString());
		console.log(accountInfo.toString());
		for (let i = 0; i < nextTokenId; i++) {
			let nft = await api.query.ormlNft.tokens(classID, i);
			if (nft.isSome) {
				nft = nft.unwrap();
				console.log(classID, i, nft.toString());
				tokenCount++;
			}
		}
	}
	console.log(`The token count of class ${classID} is ${tokenCount}.`);
}

async function demo_show_all_nfts(classID) {
	let api = await getApi();
	if (classID === undefined) {
		const allClasses = await api.query.ormlNft.classes.entries();
		for (const c of allClasses) {
			let key = c[0];
			const len = key.length;
			key = key.buffer.slice(len - 4, len);
			const classID = new Uint32Array(key)[0];
			await show_all_nfts(api, classID);
		}
	} else {
		await show_all_nfts(api, classID);
	}
	process.exit();
}

async function demo_mint_nft(keyring, account, classID) {
	let api = await getApi();
	let moduleMetadata = await getModules(api);
	account = keyring.addFromUri(account);
	const classInfo = await api.query.ormlNft.classes(classID);
	if (classInfo.isSome) {
		const ownerOfClass = classInfo.unwrap().owner.toString();
		const nftMetadata = 'aabbccdd';
		const quantity = 3;
		const balancesNeeded = await nftDeposit(api, nftMetadata, bnToBn(quantity));
		if (balancesNeeded === null) {
			return;
		}
		const txs = [
			// make sure `ownerOfClass0` has sufficient balances to mint nft.
			api.tx.balances.transfer(ownerOfClass, balancesNeeded),
			// mint nft.
			api.tx.proxy.proxy(ownerOfClass, null, api.tx.nftmart.mint(account.address, classID, nftMetadata, quantity)),
		];
		const batchExtrinsic = api.tx.utility.batchAll(txs);
		const feeInfo = await batchExtrinsic.paymentInfo(account);
		console.log("fee of batchExtrinsic: %s", feeInfo.partialFee / unit);

		let [a, b] = waitTx(moduleMetadata);
		await batchExtrinsic.signAndSend(account, a);
		await b();
	}
	process.exit();
}

async function demo_add_class_admin(keyring, account) {
	let api = await getApi();
	let moduleMetadata = await getModules(api);
	const alice = keyring.addFromUri("//Alice");
	const bob = keyring.addFromUri(account);
	const classCount = bnToBn((await api.query.ormlNft.nextClassId()).toString());

	const ownerOfClass0 = '62qUEaQwPx7g4vDz88bN4zMBTFmcwLPYbPsvbBhH2QiqWhfB'
	const balancesNeeded = await proxyDeposit(api, 1);
	if (balancesNeeded === null) {
		return;
	}
	console.log("adding a class admin needs to reserve %s", balancesNeeded);
	const txs = [
		// make sure `ownerOfClass0` has sufficient balances.
		api.tx.balances.transfer(ownerOfClass0, balancesNeeded),
		// Add Bob as a new admin.
		api.tx.proxy.proxy(ownerOfClass0, null, api.tx.proxy.addProxy(bob.address, 'Any', 0)),
	];
	const batchExtrinsic = api.tx.utility.batchAll(txs);
	const feeInfo = await batchExtrinsic.paymentInfo(alice);
	console.log("fee of batchExtrinsic: %s", feeInfo.partialFee / unit);

	let [a, b] = waitTx(moduleMetadata);
	await batchExtrinsic.signAndSend(alice, a);
	await b();

	process.exit();
}

async function demo_show_class_info() {
	let api = await getApi();
	let classCount = 0;

	const allClasses = await api.query.ormlNft.classes.entries();
	for (const c of allClasses) {
		let key = c[0];
		const len = key.length;
		key = key.buffer.slice(len - 4, len);
		const classID = new Uint32Array(key)[0];
		let clazz = c[1].toJSON();
		clazz.metadata = hexToUtf8(clazz.metadata.slice(2));
		clazz.classID = classID;
		clazz.adminList = await api.query.proxy.proxies(clazz.owner);
		console.log("%s", JSON.stringify(clazz));
		classCount++;
	}
	console.log("class count: %s", classCount);
	console.log("nextClassId: %s", await api.query.ormlNft.nextClassId());
	process.exit();
}

async function demo_create_class(keyring, account) {
	let api = await getApi();
	let moduleMetadata = await getModules(api);
	account = keyring.addFromUri(account);
	let [a, b] = waitTx(moduleMetadata);
	// pub enum ClassProperty {
	// 	/// Token can be transferred
	// 	Transferable = 0b00000001,
	// 	/// Token can be burned
	// 	Burnable = 0b00000010,
	// }
	await api.tx.nftmart.createClass("https://xx.com/aa.jpg", "aaa", "bbbb", 1 | 2).signAndSend(account, a);
	await b();
	process.exit();
}

main()
