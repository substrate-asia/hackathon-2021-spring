import secrets from 'secrets.js-grempe'
import crypto from 'eth-crypto'

import { DB } from './index'

class Metadata {
	db: DB
	encryptionSchema: {
		pieces: number, quorum: number,
		publicPieceCount: number,
		members: Array<string>,
		owner: string,
	}
	ipfs: any
	metadataCid: any
	metadata: {
		pieces: number, quorum: number, nounce: number, owner: string,
		unencrypted_cid: Array<string>, encrypted_cid: {[member: string]: string}
	}

	constructor(encryptionSchema, ipfs, db:DB) {
		this.encryptionSchema = { ...encryptionSchema }
		this.db = db
		this.ipfs = ipfs

		this.metadataCid = this.db.getCID()
		this.metadata = {}
		if (this.encryptionSchema.pieces !== this.encryptionSchema.publicPieceCount
			+ this.encryptionSchema.members.length + 1) {
				throw new Error("wrong pieces count supplied")
		}
	}

	async getIPFSMetadataNounce() {
		let nounce = 0
		if (this.metadataCid) {
			const oldMetadata = JSON.parse(await this.ipfs.cat(this.metadataCid))
			return oldMetadata.nounce
		}
		return nounce
	}

	async buildMetadata() {
		// fetch most updated nounce version
		const nounce = await this.getIPFSMetadataNounce()
		const current_nounce = this.db.getNounce()

		if (current_nounce < nounce) {
			return {cid: "-1", result: "-1"}
			throw new Error("Nounce error")
		}

		this.metadata.pieces = this.encryptionSchema.pieces
		this.metadata.quorum = this.encryptionSchema.quorum
		this.metadata.nounce = current_nounce

		this.metadata.owner = this.encryptionSchema.owner
		this.metadata.unencrypted_cid = []
		this.metadata.encrypted_cid = {}

		const msg = this.db.saveUpdates()
		const hexMsg = secrets.str2hex(JSON.stringify(msg))
		const shares = secrets.share(hexMsg,
			this.encryptionSchema.pieces,
			this.encryptionSchema.quorum)

		let pt = 0;
		for (; pt < this.encryptionSchema.publicPieceCount; pt++) {
			this.metadata.unencrypted_cid.push(await this.upload(shares[pt]))
		}

		this.metadata.encrypted_cid[this.encryptionSchema.owner + ""] = await this.upload(
			await Metadata.encrypt(this.encryptionSchema.owner, shares[pt])
		)
		pt += 1

		if (this.encryptionSchema.members != null) {
			for (let member of this.encryptionSchema.members) {
				this.metadata.encrypted_cid[member + ""] = 
					await this.upload(await Metadata.encrypt(member, shares[pt]))
				pt += 1
			}
		}

		const newCid = await this.upload(JSON.stringify(this.metadata))

		this.metadataCid = newCid
		this.db.writeCID(newCid)
		return {cid: newCid, result: this.metadata}
	}

	async upload(content) {
		const result = await this.ipfs.add(content)
		await this.ipfs.pin(result.cid)
		return result.cid.toString()
	}

	async recover(metadata, publicKey, privateKey) {
		if (this.encryptionSchema.quorum <= 1 + this.encryptionSchema.publicPieceCount) {
			let contents = []

			for (let content of metadata.unencrypted_cid)
				contents.push(await this.ipfs.cat(content))

			for (let member in this.metadata.encrypted_cid) {
				if (member == publicKey)
					contents.push(await Metadata.decrypt(privateKey,
						await this.ipfs.cat(this.metadata.encrypted_cid[member])))
			}

			const result = await Metadata.recover(contents)

			try {
				return JSON.parse(result)
			} catch (err) {
				console.error(err)
				throw new Error("Decryption Failure")
			}
		} else {
			throw new Error("decryption quorum not met")
		}
	}

	static async encrypt(publicKey, content) {
		return crypto.cipher.stringify(await crypto.encryptWithPublicKey(publicKey, content))
	}
	static async decrypt(privateKey, content) {
		return await crypto.decryptWithPrivateKey(privateKey, crypto.cipher.parse(content))
	}
	static async recover(contents) {
		return await secrets.hex2str(secrets.combine(contents))
	}
}

export {Metadata}
