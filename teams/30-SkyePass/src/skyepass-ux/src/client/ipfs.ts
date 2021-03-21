import createClient from 'ipfs-http-client'
import cid from 'cids'

class IPFSConfig {
	host: string
	port: number
	protocol: 'https' | 'http' | 'ws'

	constructor(host: string, port: number, protocol: 'https' | 'http' | 'ws') {
		this.host = host
		this.port = port
		this.protocol = protocol
	}
}

class IPFS {
	private client: any

	constructor(config: IPFSConfig) {
		this.client = createClient(config)
	}
	
	public async add(str:string) {
		return await this.client.add(str)
	}
	public async cat(cid:string) {
		// TODO: check CID validity
		let result = ''
		const stream = this.client.cat(cid)
		for await (const chunk of stream) {
				result += chunk.toString()
		}
		return result
	}
	public async pin(cid:string) {
		// TODO: check CID validity
		return await this.client.pin.add(cid)
	}
}
export {IPFS}
