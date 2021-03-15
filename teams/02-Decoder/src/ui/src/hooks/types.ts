import { ITuple } from '@polkadot/types/types';
import { GenericAccountId,UInt,Struct } from '@polkadot/types'
import { Enum } from '@polkadot/types/codec';

/** @name AccountId */
export interface AccountId extends GenericAccountId {}
/** @name AccountLike */
export type AccountLike = AccountId | string;
/** @name AirDropCurrencyId */
export interface AirDropCurrencyId extends Enum {
    readonly isBdt: boolean;
}
/** @name Balance */
export interface Balance extends UInt {
}
/** @name CurrencyId */
export interface CurrencyId extends Enum {
    readonly isToken: boolean;
    readonly asToken: TokenSymbol;
    readonly isDexShare: boolean;
    readonly asDexShare: ITuple<[TokenSymbol, TokenSymbol]>;
}
/** @name CurrencyLike */
export type CurrencyLike = CurrencyId | string;
/** @name DataProviderId */
export interface DataProviderId extends Enum {
    readonly isAggregated: boolean;
    readonly isSublend: boolean;
    readonly isBand: boolean;
}
/** @name DebitBalance */
export interface DebitBalance extends Balance {
}
export interface DerivedUserLoan {
    currency: CurrencyId | string;
    account: AccountId | string;
    collateral: Balance;
    debit: DebitBalance;
}
/** @name OrmlAccountData */
export interface OrmlAccountData extends Struct {
  readonly free: Balance;
  readonly frozen: Balance;
  readonly reserved: Balance;
}
/** @name TokenSymbol */
export interface TokenSymbol extends Enum {
    readonly isBdt: boolean;
    readonly isBusd: boolean;
    readonly isDot: boolean;
    readonly isLdot: boolean;
}
/** @name TradingPair */
export interface TradingPair extends ITuple<[CurrencyId, CurrencyId]> {
}
/** @name PHANTOM_PRIMITIVES */
export declare type PHANTOM_PRIMITIVES = 'primitives';