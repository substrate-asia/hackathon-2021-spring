import { BaseReq } from './baseReq';

export default class ScratchReq extends BaseReq {
	constructor () {
		super();
		this.url = '';
	}

    url: string;
}
