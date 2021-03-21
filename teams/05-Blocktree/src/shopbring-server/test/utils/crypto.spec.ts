
import { hexToU8a, stringToU8a } from '@polkadot/util';
import { waitReady } from '@polkadot/wasm-crypto';

import Crypto from '../../src/utils/crypto';

const ADDR_ED = 'DxN4uvzwPzJLtn17yew6jEffPhXQfdKHTp2brufb98vGbPN';
const ADDR_SR = 'EK1bFgKm2FsghcttHT7TB7rNyXApFgs9fCbijMGQNyFGBQm';
const ADDR_EC = 'XyFVXiGaHxoBhXZkSh6NS2rjFyVaVNUo5UiZDqZbuSfUdji';
const ADDR_ET = '0x54Dab85EE2c7b9F7421100d7134eFb5DfA4239bF';
const MESSAGE = 'hello world';
const SIG_ED = '0x299d3bf4c8bb51af732f8067b3a3015c0862a5ff34721749d8ed6577ea2708365d1c5f76bd519009971e41156f12c70abc2533837ceb3bad9a05a99ab923de06';
const SIG_SR = '0xca01419b5a17219f7b78335658cab3b126db523a5df7be4bfc2bef76c2eb3b1dcf4ca86eb877d0a6cf6df12db5995c51d13b00e005d053b892bd09c594434288';
const SIG_EC = '0x994638ee586d2c5dbd9bacacbc35d9b7e9018de8f7892f00c900db63bc57b1283e2ee7bc51a9b1c1dae121ac4f4b9e2a41cd1d6bf4bb3e24d7fed6faf6d85e0501';
const SIG_ET = '0x4e35aad35793b71f08566615661c9b741d7c605bc8935ac08608dff685324d71b5704fbd14c9297d2f584ea0735f015dcf0def66b802b3f555e1db916eda4b7700';

describe('VerifySignature', (): void => {
	beforeEach(async (): Promise<void> => {
		await waitReady();
	});

	it('throws on invalid signature length', (): void => {
		expect(
			() => Crypto.VerifySignature(MESSAGE, new Uint8Array(32), ADDR_ED)
		).toThrow('Invalid signature length, expected [64..66] bytes, found 32');
	});

	describe('verifyDetect', (): void => {
		it('verifies an ed25519 signature', (): void => {
			expect(Crypto.VerifySignature(MESSAGE, SIG_ED, ADDR_ED)).toEqual({
				crypto: 'ed25519',
				isValid: true,
				publicKey: Crypto.GetPublicKey(ADDR_ED)
			}.isValid);
		});

		it('verifies an ecdsa signature', (): void => {
			expect(Crypto.VerifySignature(MESSAGE, SIG_EC, ADDR_EC)).toEqual({
				crypto: 'ecdsa',
				isValid: true,
				publicKey: Crypto.GetPublicKey(ADDR_EC)
			}.isValid);
		});

		it('verifies an ethereum signature', (): void => {
			expect(Crypto.VerifySignature(MESSAGE, SIG_ET, ADDR_ET)).toEqual({
				crypto: 'ethereum',
				isValid: true,
				publicKey: hexToU8a(ADDR_ET)
			}.isValid);
		});

		it('verifies an ethereum signature (known)', (): void => {
			const message = 'Pay KSMs to the Kusama account:88dc3417d5058ec4b4503e0c12ea1a0a89be200fe98922423d4334014fa6b0ee';

			expect(Crypto.VerifySignature(
				`\x19Ethereum Signed Message:\n${message.length.toString()}${message}`,
				'0x55bd020bdbbdc02de34e915effc9b18a99002f4c29f64e22e8dcbb69e722ea6c28e1bb53b9484063fbbfd205e49dcc1f620929f520c9c4c3695150f05a28f52a01',
				'0x002309df96687e44280bb72c3818358faeeb699c'
			)).toEqual({
				crypto: 'ethereum',
				isValid: true,
				publicKey: hexToU8a('0x002309df96687e44280bb72c3818358faeeb699c')
			}.isValid);
		});

		it('fails on invalid ethereum signature', (): void => {
			expect(Crypto.VerifySignature(MESSAGE, SIG_EC, ADDR_ET)).toEqual({
				crypto: 'none',
				isValid: false,
				publicKey: hexToU8a(ADDR_ET)
			}.isValid);
		});

		it('verifies an sr25519 signature', (): void => {
			expect(Crypto.VerifySignature(MESSAGE, SIG_SR, ADDR_SR)).toEqual({
				crypto: 'sr25519',
				isValid: true,
				publicKey: Crypto.GetPublicKey(ADDR_SR)
			}.isValid);
		});

		it('allows various inputs', (): void => {
			expect(Crypto.VerifySignature(stringToU8a(MESSAGE), hexToU8a(SIG_ED), Crypto.GetPublicKey(ADDR_ED))).toEqual({
				crypto: 'ed25519',
				isValid: true,
				publicKey: Crypto.GetPublicKey(ADDR_ED)
			}.isValid);
		});

		it('fails on an invalid signature', (): void => {
			expect(Crypto.VerifySignature(MESSAGE, SIG_SR, ADDR_ED)).toEqual({
				crypto: 'none',
				isValid: false,
				publicKey: Crypto.GetPublicKey(ADDR_ED)
			}.isValid);
		});
	});

});
