import {
	getApi,
	getModules,
	waitTx,
	getEventsByNumber,
	getExtrinsicByNumber,
	sleep
} from "./utils.mjs";

async function getFinalizedHeadNumber(api) {
	return api.rpc.chain.getFinalizedHead()
		.then((hash) => api.rpc.chain.getBlock(hash))
		.then((block) => block.block.header.number.toNumber());
}

async function handleEvents(api, num, moduleMetadata) {
	const [blockHash, events] = await getEventsByNumber(api, num);
	const signedBlock = await getExtrinsicByNumber(api, num);

	let extrinsicArray = [];
	signedBlock.block.extrinsics.forEach((ex, index) => {
		extrinsicArray[index] = [ex, []];
	});

	for (const recordMap of events) {
		if (recordMap.phase.isApplyExtrinsic) {
			const index = recordMap.phase.asApplyExtrinsic;
			extrinsicArray[index][1].push(recordMap.event);
		} else {
			/**
			 * pub enum Phase {
			 *   /// Applying an extrinsic.
			 *   ApplyExtrinsic(u32),
			 *   /// Finalizing the block.
			 *   Finalization,
			 *   /// Initializing the block.
			 *   Initialization,
			 * }
			 */
			console.log(recordMap.toHuman());
		}
	}

	extrinsicArray.forEach((extrinsic, _index) => {
		const events = extrinsic[1];
		extrinsic = extrinsic[0];

		let module = moduleMetadata.index[extrinsic.callIndex[0]];
		let method = extrinsic.meta.name;

		console.log(`Call ${module.name}.${method} = ${extrinsic.method.toString()}`);
		for (let e of events) {
			const event = `${e.section}.${e.method}`;
			switch (event) {
				case 'system.ExtrinsicSuccess':
					console.log("    Success %s", event);
					break;
				case 'system.ExtrinsicFailed':
					for (const d of e.data) {
						if (d.isModule) {
							const index = d.asModule.index;
							const error = d.asModule.error;
							const errModule = moduleMetadata.index[index].name;
							const errName = moduleMetadata.index[index].errors[error].name;
							const errDesc = moduleMetadata.index[index].errors[error].documentation.join();
							console.log("    Failure %s %s.%s(%s)", event, errModule, errName, errDesc);
						}
					}
					break;
				case 'proxy.ProxyExecuted':
					for (let d of e.data) {
						d = d.toJSON();
						if (d.Err && d.Err.Module && d.Err.Module.index && d.Err.Module.error) {
							let module = moduleMetadata[d.Err.Module.index];
							console.log("    ProxyFailure: %s.%s", module.name, module.errors[d.Err.Module.error].name);
						} else {
							console.log("    Event %s", event);
						}
					}
					break;
				default:
					console.log("    Event %s", event);
					break;
			}
		}
	});
}

async function main() {
	const api = await getApi();

	let moduleMetadata = await getModules(api);
	let startBlockNumber = await getFinalizedHeadNumber(api);

	// startBlockNumber = 32339;
	let endBlockNumber = -1;

	for (; ;) {
		try {
			if (endBlockNumber !== -1 && startBlockNumber > endBlockNumber) {
				process.exit();
			}
			const last = await getFinalizedHeadNumber(api);
			if (startBlockNumber <= last) {
				await handleEvents(api, startBlockNumber, moduleMetadata);
				startBlockNumber++;
			} else {
				await sleep(200);
			}
		} catch (e) {
			console.log(e);
			await sleep(2000)
		}
	}
}

main().catch(console.error).finally(() => process.exit());

