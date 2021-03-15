const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const BN = require('bn.js')

const custrom_types = {}

const provider = new WsProvider('ws://127.0.0.1:9944')
const api = new ApiPromise({ provider, types: custrom_types })
let nonce = 0

const main = async () => {
    console.log('Start connecting ...')
    api.on('connected', () => console.log('Connection established'))
    api.on('error', err => console.log('API connection failed: ', err))
    api.on('ready', async () => {
        console.log('API is ready')

        // Retrieve the chain & node information information via rpc calls
        const [nodeName, nodeVersion] = await Promise.all([
            api.rpc.system.name(),
            api.rpc.system.version()
        ])

        console.log(`We have connected to ${nodeName}-v${nodeVersion}`)

        await cryptoWaitReady()

        const keyring = new Keyring({ type: 'sr25519' })
        // alice is sudo on test mode
        const sudo_account = keyring.addFromUri('//Alice')
        const donut_account = keyring.addFromUri('//Dave')
        const steem_account = '0x' + Buffer.from("steem user").toString('hex')
        const bridge_sig = '0x' + Buffer.from('dummy signature').toString('hex')
        const bn_decimals = new BN(api.registry.chainDecimals[0])

        const issue_donut = async () => {
            console.log('--- Submitting extrinsic to issue DNUT into donut account: ', donut_account.address, ' ---')
            
            return new Promise(async (resolve, reject) => {
                if (!nonce) {
                    nonce = (await api.query.system.account(sudo_account.address)).nonce.toNumber()
                }
                const unsub = await api.tx.sudo
                .sudo(
                    api.tx.donutCore.sudoIssueDonut(donut_account.address, steem_account, new BN(200000000000000), bridge_sig)
                )
                .signAndSend(sudo_account, { nonce: nonce, era: 0 }, (result) => {
                    console.log(`Current status is ${result.status}`)
                    if (result.status.isInBlock) {
                        console.log(`Transaction included at blockHash ${result.status.asInBlock}`)
                    } else if (result.status.isFinalized) {
                        console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`)
                        unsub()
                        return resolve(result.status.asFinalized)
                    }
                }).catch(err => reject(err))
                nonce += 1
            })
        }

        const burn_donut = async () => {
            console.log('--- Submitting extrinsic to burn DNUT from donut account: ', donut_account.address, ' ---')

            return new Promise(async (resolve, reject) => {
                if (!nonce) {
                    nonce = (await api.query.system.account(sudo_account.address)).nonce.toNumber()
                }
                const unsub = await api.tx.sudo
                .sudo(
                    api.tx.donutCore.sudoBurnDonut(donut_account.address, steem_account, new BN(100000000000000), bridge_sig)
                )
                .signAndSend(sudo_account, { nonce: nonce, era: 0 }, (result) => {
                    console.log(`Current status is ${result.status}`)
                    if (result.status.isInBlock) {
                        console.log(`Transaction included at blockHash ${result.status.asInBlock}`)
                    } else if (result.status.isFinalized) {
                        console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`)
                        unsub()
                        return resolve(result.status.asFinalized)
                    }
                }).catch(err => reject(err))
                nonce += 1
            })
        }

        // Subscribe to system events and look up events we care
        api.query.system.events((events) => {
            // console.log(`\nReceived ${events.length} events:`)
        
            // Loop through the Vec<EventRecord>
            events.forEach((record) => {
                // Extract the phase, event and the event types
                const { event, phase } = record
                const types = event.typeDef
        
                // Show what we are busy with
                //   console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`)
                //   console.log(`\t\t${event.meta.documentation.toString()}`)
        
                // DNUT issuing happened
                if (event.method === 'DonutIssued') {
                    let arguments = []
                    event.data.forEach((data, index) => {
                        arguments.push(data.toString())
                    })

                    // DonutIssued: Donut Account/Steem Account/Amount
                    console.log('Details of event DonutIssued ')
                    console.log(`\t\tDonut Account: ${arguments[0]}`)
                    console.log(`\t\tSteem Account: ${Buffer.from(arguments[1].slice(2), 'hex').toString()}`)
                    console.log(`\t\tIssued Amount: ${arguments[2]}`)
                }

                // DNUT burning happened
                if (event.method === 'DonutBurned') {
                    let arguments = []
                    event.data.forEach((data, index) => {
                        arguments.push(data.toString())
                    })

                    // DonutBurned: Donut Account/Steem Account/Amount
                    console.log('Details of event DonutBurned ')
                    console.log(`\t\tDonut Account: ${arguments[0]}`)
                    console.log(`\t\tSteem Account: ${Buffer.from(arguments[1].slice(2), 'hex').toString()}`)
                    console.log(`\t\tBurned Amount: ${arguments[2]}`)
                }
            })
        })

        await issue_donut()
        await burn_donut()
        console.log('--- All transactions has finalized, testing completely! ---')
        process.exit(0)
    })
}

main().catch((error) => {
    console.error(error)
    process.exit(-1)
  })