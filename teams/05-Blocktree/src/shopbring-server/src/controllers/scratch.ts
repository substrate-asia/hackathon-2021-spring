import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

import ScratchReq from '../dto/scratchReq';
import { errx, reqx, resx } from '../utils/webx';

export function GetTaobao (req: Request, res: Response, next: NextFunction): void {
	const req_ = reqx<ScratchReq>(req, next);
	if (!req_) {
		return;
	}

	axios.post('https://www.86daigou.com/ajax/get_taobao?url=' + encodeURI(req_.url))
		.then(resp => {
			resx(req, res, resp.data);
		}).catch(err => {
			errx(next, err);
		});
}
