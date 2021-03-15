import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import {v4 as uuid} from 'uuid'

class DB {
	db: low

	constructor(file: string) {
		this.db = low(new FileSync(file))
		this.db.defaults({
			'package': {
				"last_cid": "",
				"nounce": 0,
				"common": ['password.skye.kiwi', 'notes.skye.kiwi'],
				"installed": []
			},
			'password.skye.kiwi': [],
			'note.skye.kiwi': [],
			'creditcard.skye.kiwi': [],
			'polkadot.wallet.skye.kiwi': [],
			'ethereum.wallet.skye.kiwi': [],
		}).write()
	}

	public addItem(appId:string, content:any) {
		if (this.db.get(appId).value() == undefined) {
			throw(new Error('not a valid AppID'))
		}

		content.uuid = uuid()
		try {
			this.db.get(appId).push(content).write() } 
		catch (error) {console.error(error)}
	}
	
	public readItems(appId:string) {
		try { return this.db.get(appId).value().sort() } 
		catch (err) { console.error(err) }
	}

	public deleteItem(appId:string, uuid:uuid) {
		try { this.db.get(appId).remove((x) => x.uuid == uuid).write() }
		catch (err) { console.error(err) }
	}

	public updateItem(appId:string, uuid:uuid, content:any) {
		try { 
			content.uuid = uuid
			this.db.get(appId).remove((x) => x.uuid == uuid).write()
			this.db.get(appId).push(content).write() 
		} catch (err) { console.error(err) }
	}

	public installApp(appId:string, appMetadata:object) {
		try {
			this.db.get('package.installed').push(appId).write()
			this.db.setWith(`package.["${appId}"]`, appMetadata).write()
			this.db.setWith(`["${appId}"]`, []).write()
		} catch(err) {console.error(err)}
	}

	public getMetadata() {
		try { return this.db.get('package').value() }
		catch(err) {console.error(err)}
	}
	public getNounce() {
		return this.db.get('package.nounce').value()
	}
	public saveUpdates() {
		this.db.update('package.nounce', n => n + 1).write()
		return this.db.getState()
	}
	public writeCID(cid) {
		this.db.set('package.last_cid', cid).write()
	}
	public getCID(){
		return this.db.get('package.last_cid').value()
	}
	public toJson() {
		return this.db.getState()
	}
}
export {DB}
