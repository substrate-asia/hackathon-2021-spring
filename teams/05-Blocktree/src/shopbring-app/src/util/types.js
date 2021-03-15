export default {
	Address: 'AccountId',
	LookupSource: 'AccountId',
	AssetId: 'u32',
	BlockNumber: 'u32',
	BalanceOf: 'u128',
	Byte4: '[u8; 4]',
	Byte8: '[u8; 8]',
	Byte16: '[u8; 16]',
	Byte32: '[u8; 32]',
	Byte64: '[u8; 64]',
	Byte128: '[u8; 128]',
	OrderStatus: {
		_enum: [
			'Pending',
			'Accepted',
			'Shipping',
			'Received',
			'Returning',
			'Closed',
			'Failed',
			'Archived'
		]
	},
	ReturnStatus: {
		_enum: [
			'Applied',
			'Accepted',
			'Refused',
			'Shipping',
			'Returned',
			'NoResponse',
			'Closed',
			'Archived'
		]
	},
	OrderInfo: {
		consumer: 'AccountId',
		shopping_agent: 'Option<AccountId>',
		payment_amount: 'BalanceOf',
		tip: 'BalanceOf',
		return_amount: 'BalanceOf',
		currency: 'AssetId',
		status: 'OrderStatus',
		create_time: 'BlockNumber',
		accept_time: 'BlockNumber',
		shipping_time: 'BlockNumber',
		end_time: 'BlockNumber',
		required_deposit: 'BalanceOf',
		required_credit: 'u64',
		shipping_hash: 'Option<Hash>',
		is_return: 'bool',
		version: 'u32'
	},
	ReturnInfo: {
		consumer: 'AccountId',
		shopping_agent: 'AccountId',
		return_amount: 'BalanceOf',
		status: 'ReturnStatus',
		create_time: 'BlockNumber',
		accept_time: 'BlockNumber',
		shipping_time: 'BlockNumber',
		end_time: 'BlockNumber',
		shipping_hash: 'Option<Hash>',
		version: 'u32'
	},
	AssetInfo: {
		symbol: 'Vec<u8>',
		decimal_places: 'u8'
	},
	InvitationInfo: {
		invitation_pk: 'Byte32',
		unit_bonus: 'BalanceOf',
		max_invitees: 'u32',
		frozen_amount: 'Balance',
		num_of_invited: 'u32',
		invitation_index: 'u32'
	},
	InvitationIndex: 'u64',
	OrderInfoOf: 'OrderInfo',
	ReturnInfoOf: 'ReturnInfo'
};