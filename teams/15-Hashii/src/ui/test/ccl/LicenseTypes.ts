/**
 * @copyright © 2020 Copyright ccl
 * @date 2020-12-08
 */

import {TransactionReceipt} from 'web3z';
import {Primitive} from './Primitive';

import * as json from './LicenseTypes.json';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = '0x7Fd39e8cd77A8c99c2682fE45c512F694C4eB8A4';

export interface LicenseType {
	certificate_type_name: string; // varchar(256) NOT NULL COMMENT '证照类型名称', --'建筑施工特种作业人员操作资格证书', 
	certificate_type_name_code: string; // varchar(64) NOT NULL COMMENT '证照类型代码', --'11100000000013338W032', 
	certificate_define_authority_name: string; // varchar(256) DEFAULT NULL COMMENT '证照定义机构名称', --'中华人民共和国住房和城乡建设部', 
	certificate_define_authority_code: string; // varchar(32) DEFAULT NULL COMMENT '证照定义机构代码', --'11100000000013338W', 
	certificate_holder_type_name: string; // varchar(512) DEFAULT NULL COMMENT '持证主体代码类型名称', --'公民身份号码', 
	shared_province: string[]; // 共享省份
}

/**
 * 电子证照数据目录数据
 */
export default interface LicenseTypes extends Primitive {

	/**
	 * 通过证照类型代码获取类型数据
	 */
	get(certificate_type_name_code: string): Promise<LicenseType>;

	/**
	 * 添加证照类型数据
	 */
	set(
		certificate_type_name_code: string,
		certificate_type_name: string,
		certificate_define_authority_name: string,
		certificate_define_authority_code: string,
		certificate_holder_type_name: string,
		shared_province: string[]
	): Promise<TransactionReceipt>;

}