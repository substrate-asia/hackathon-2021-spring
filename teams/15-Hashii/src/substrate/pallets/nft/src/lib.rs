#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Encode, Decode};
use frame_support::{debug, ensure, decl_module, decl_storage, decl_event, decl_error, dispatch, traits::{Get, Currency, ReservableCurrency, ExistenceRequirement}, Parameter};
use frame_system::ensure_signed;
use sp_runtime::{
	DispatchResult, DispatchError, RuntimeDebug,
	traits::{AtLeast32BitUnsigned, MaybeSerializeDeserialize, Bounded, One, CheckedAdd, CheckedSub},
};
use sp_std::result::Result;
use sp_std::prelude::*;
use sp_runtime::SaturatedConversion;
use substrate_fixed::types::U64F64;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

pub trait Trait: frame_system::Trait {
	type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;
	// 拍卖订单最小保留区块数
	type MinKeepBlockNumber: Get<Self::BlockNumber>;
	// 拍卖订单最大保留区块数
	type MaxKeepBlockNumber: Get<Self::BlockNumber>;
	// 最小拍卖价格
	type MinimumPrice: Get<BalanceOf<Self>>;
	// 最小质押投票数量
	type MinimumVotingLock: Get<BalanceOf<Self>>;
	// 用于分润算法的固定利润常数
	type FixRate: Get<f64>;
	// 参与质押的分润比例
	type ProfitRate: Get<f64>;
	type DayBlockNum: Get<Self::BlockNumber>;
	type NftId: Parameter + AtLeast32BitUnsigned + Default + Copy + MaybeSerializeDeserialize + Bounded;
	type OrderId: Parameter + AtLeast32BitUnsigned + Default + Copy + MaybeSerializeDeserialize + Bounded;
	type Currency: ReservableCurrency<Self::AccountId>;
}

#[derive(Encode, Decode, Clone, RuntimeDebug, Eq, PartialEq)]
pub struct Order<OrderId, NftId, AccountId, Balance, BlockNumber> {
	pub order_id: OrderId,
	pub start_price: Balance,
	pub end_price: Balance,
	pub nft_id: NftId,
	pub create_block: BlockNumber,
	pub keep_block_num: BlockNumber,
	pub owner: AccountId,
}

#[derive(Encode, Decode, Clone, RuntimeDebug)]
pub struct Nft {
	pub title: Vec<u8>,
	pub url: Vec<u8>,
	pub desc: Vec<u8>,
}

#[derive(Encode, Decode, Clone, RuntimeDebug, Eq, PartialEq)]
pub struct Bid<OrderId, AccountId, Balance> {
	pub order_id: OrderId,
	pub price: Balance,
	pub owner: AccountId,
}

#[derive(Encode, Decode, Clone, RuntimeDebug, Eq, PartialEq)]
pub struct Vote<OrderId, AccountId, Balance, BlockNumber> {
	pub order_id: OrderId,
	pub amount: Balance,
	pub keep_block_num: BlockNumber,
	pub owner: AccountId,
}

type BalanceOf<T> = <<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::Balance;
type OrderOf<T> = Order<<T as Trait>::OrderId, <T as Trait>::NftId, <T as frame_system::Trait>::AccountId, BalanceOf<T>, <T as frame_system::Trait>::BlockNumber>;
type BidOf<T> = Bid<<T as Trait>::OrderId, <T as frame_system::Trait>::AccountId, BalanceOf<T>>;
type VoteOf<T> = Vote<<T as Trait>::OrderId, <T as frame_system::Trait>::AccountId, BalanceOf<T>, <T as frame_system::Trait>::BlockNumber>;

decl_storage! {
	trait Store for Module<T: Trait> as NftModule {
		// nftId -> nft详情， 用于存储所有nft
		pub Nfts: map hasher(twox_64_concat) T::NftId => Option<Nft>;
		// nftId -> 账户Id， 用于记录nft所有者
		pub NftAccount: map hasher(twox_64_concat) T::NftId => T::AccountId;

		// nftId -> 订单Id， 用于记录Nft对应的订单数据
		pub NftOrder: map hasher(twox_64_concat) T::NftId => Option<T::OrderId>;
		// 订单Id -> 订单详情, 用于存储所有待完成的拍卖订单
		pub Orders: map hasher(twox_64_concat) T::OrderId => Option<OrderOf<T>>;
		// 订单Id -> 当前最大出价，用于存储当前订单的最大出价
		pub Bids: map hasher(twox_64_concat) T::OrderId => Option<BidOf<T>>;
		// 订单Id -> 质押投票列表, 用于存储质押列表
		pub Votes: map hasher(twox_64_concat) T::OrderId => Vec<VoteOf<T>>;

		// NftId生成器，递增
		pub NextNftId: T::NftId;
		// 拍卖订单Id生成器，递增
		pub NextOrderId: T::OrderId;
	}
}

decl_event!(
	pub enum Event<T> where
		<T as Trait>::NftId,
		<T as Trait>::OrderId,
		AccountId = <T as frame_system::Trait>::AccountId,
	{
		NftCreated(AccountId, NftId),
		NftRemove(AccountId, NftId),
		NftTransfer(AccountId, AccountId, NftId),

		OrderSell(AccountId, OrderId),
		OrderBuy(AccountId, OrderId),

		OrderComplete(AccountId, OrderId),
		OrderCancel(AccountId, OrderId),
	}
);

decl_error! {
	pub enum Error for Module<T: Trait> {
		NftIdNotExist,
		NftIdOverflow,
		NotNftOwner,
		NftOrderExist,
		OrderNotExist,
		OrderPriceIllegal,
		OrderPriceTooSmall,
		KeepBlockNumTooBig,
		KeepBlockNumTooSmall,
		IsTimeToSettlement,
		IsNotTimeToSettlement,
		OrderIdOverflow,
		OrderIdNotExist,
		BlockNumberOverflow,
		PriceTooLow,
		StartPriceTooLow,
		VoteAmountTooLow,
	}
}

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		type Error = Error<T>;

		fn deposit_event() = default;

		const MinKeepBlockNumber: T::BlockNumber = T::MinKeepBlockNumber::get();
		const MaxKeepBlockNumber: T::BlockNumber = T::MaxKeepBlockNumber::get();
		const MinimumPrice: BalanceOf<T> = T::MinimumPrice::get();
		const MinimumVotingLock: BalanceOf<T> = T::MinimumVotingLock::get();

		// 创建Nft艺术品
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn create(origin, title: Vec<u8>, url: Vec<u8>, desc: Vec<u8>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			let nft = Nft {
				title,
				url,
				desc
			};
			NextNftId::<T>::try_mutate(|id| -> DispatchResult {
				let nft_id = *id;
				*id = id.checked_add(&One::one()).ok_or(Error::<T>::NftIdOverflow)?;
				// 创建nft并建立 nft索引、账户索引
				Nfts::<T>::insert(nft_id, &nft);
				NftAccount::<T>::insert(nft_id, who.clone());
				Self::deposit_event(RawEvent::NftCreated(who, nft_id));
				Ok(())
			})?;
			Ok(())
		}

		// 移除Nft
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn remove(origin, nft_id: T::NftId) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			// 检查nft是否存在
			ensure!(Nfts::<T>::contains_key(&nft_id), Error::<T>::NftIdNotExist);

			let owner = NftAccount::<T>::get(&nft_id);
			// 检查nft所有者
			ensure!(owner == who, Error::<T>::NotNftOwner);
			// 检查nft是否处于订单中
			ensure!(!NftOrder::<T>::contains_key(&nft_id), Error::<T>::NftOrderExist);

			// 移除nft的两个索引
			NftAccount::<T>::remove(nft_id);
			Nfts::<T>::remove(nft_id);

			Self::deposit_event(RawEvent::NftRemove(who, nft_id));
			Ok(())
		}

		// 转移Nft艺术品
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn transfer(origin, target: T::AccountId, nft_id: T::NftId) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			// 检查nft是否存在
			ensure!(Nfts::<T>::contains_key(&nft_id), Error::<T>::NftIdNotExist);

			// 检查nft的所有者
			let owner = NftAccount::<T>::get(&nft_id);
			ensure!(owner == who, Error::<T>::NotNftOwner);

			// 检查nft是否处于订单中
			ensure!(!NftOrder::<T>::contains_key(&nft_id), Error::<T>::NftOrderExist);

			// 更改nft账户索引
			NftAccount::<T>::insert(nft_id, target.clone());
			Self::deposit_event(RawEvent::NftTransfer(who, target, nft_id));
			Ok(())
		}

		// 下拍卖单出售艺术品
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn order_sell(origin, nft_id: T::NftId, start_price: BalanceOf<T>, end_price: BalanceOf<T>, keep_block_num: T::BlockNumber) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			// 检查keep_block_num是否合法
			ensure!(keep_block_num <= T::MaxKeepBlockNumber::get(), Error::<T>::KeepBlockNumTooBig);
			ensure!(keep_block_num >= T::MinKeepBlockNumber::get(), Error::<T>::KeepBlockNumTooSmall);

			// 检查nft是否存在
			ensure!(Nfts::<T>::contains_key(&nft_id), Error::<T>::NftIdNotExist);

			// 检查nft的所有者
			let owner = NftAccount::<T>::get(&nft_id);
			ensure!(owner == who, Error::<T>::NotNftOwner);

			// 检查nft是否处于订单中
			ensure!(!NftOrder::<T>::contains_key(&nft_id), Error::<T>::NftOrderExist);

			// 检查最小价格
			ensure!(T::MinimumPrice::get() <= start_price, Error::<T>::StartPriceTooLow);

			// 检查价格是否合法
			ensure!(start_price <= end_price, Error::<T>::OrderPriceIllegal);

			// 创建订单
			NextOrderId::<T>::try_mutate(|id| -> DispatchResult {
				let order_id = *id;
				let order = Order {
					order_id,
					start_price,
					end_price,
					nft_id,
					create_block: frame_system::Module::<T>::block_number(),
					keep_block_num,
					owner: who.clone(),
				};
				*id = id.checked_add(&One::one()).ok_or(Error::<T>::OrderIdOverflow)?;
				// 插入订单索引
				Orders::<T>::insert(order_id, order.clone());
				NftOrder::<T>::insert(nft_id, order_id);
				let votes: Vec<VoteOf<T>> = Vec::new();
				Votes::<T>::insert(order_id, votes);
				Self::deposit_event(RawEvent::OrderSell(who, order_id));
				Ok(())
			})?;
			Ok(())
		}

		// 竞拍Nft艺术品
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn order_buy(origin, order_id: T::OrderId, price: BalanceOf<T>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;

			// 检查订单是否存在
			let order: OrderOf<T> = Orders::<T>::get(order_id).ok_or(Error::<T>::OrderNotExist)?;

			// 检查是否到了结算时间
			ensure!(!Self::is_time_to_settlement(&order)?, Error::<T>::IsTimeToSettlement);

			// 检查最小价格
			ensure!(T::MinimumPrice::get() <= price, Error::<T>::PriceTooLow);

			// 检查价格是否合法
			ensure!(order.start_price <= price, Error::<T>::OrderPriceTooSmall);

			// 检查是否比上个竞价要大
			let bidopt: Option<BidOf<T>> = Bids::<T>::get(order_id);
			if let Some(bid) = bidopt {
				ensure!(bid.price < price, Error::<T>::OrderPriceTooSmall);
			}

			// 检查是否到了最大价格
			if price >= order.end_price {
				// 达到最大价格，拍卖成功
				Self::order_complete(&order, &who, order.end_price, &who)?;
				// 移除上个bid
				Self::clean_order_bid(order_id);
			} else {
				// 参与竞价
				// 锁定价格
				T::Currency::reserve(&who, price)?;
				// 移除之前的bid
				Self::clean_order_bid(order_id);
				// 创建新的bid
				let bid = Bid {
					order_id,
					price,
					owner: who.clone()
				};
				Bids::<T>::insert(order_id, bid.clone());
				Self::deposit_event(RawEvent::OrderBuy(who, order_id));
			}
			Ok(())
		}

		// 主动结算拍卖 // 用于到期结算
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn order_settlement(origin, order_id: T::OrderId) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			// 检查订单是否存在
			let order: OrderOf<T> = Orders::<T>::get(order_id).ok_or(Error::<T>::OrderNotExist)?;
			// 检查是否可以进行结算订单
			ensure!(Self::is_time_to_settlement(&order)?, Error::<T>::IsNotTimeToSettlement);

			// 获取最后那个竞价
			let bidopt: Option<BidOf<T>> = Bids::<T>::get(order_id);
			if let Some(bid) = bidopt {
				// 移除之前的bid
				Self::clean_order_bid(order_id);
				Self::order_complete(&order, &bid.owner, bid.price, &who)?;
				Self::deposit_event(RawEvent::OrderComplete(bid.owner, order_id));
			} else {
				// 移除订单索引
				Orders::<T>::remove(order_id);
				NftOrder::<T>::remove(order.nft_id);
				let votes: Vec<VoteOf<T>> = Votes::<T>::get(order_id);
				for vote in votes {
					T::Currency::unreserve(&vote.owner, vote.amount);
				}
				Votes::<T>::remove(order_id);
				Self::deposit_event(RawEvent::OrderCancel(order.owner, order_id));
			}
			Ok(())
		}

		// 进行投票质押
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn vote_order(origin, order_id: T::OrderId, amount: BalanceOf<T>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			// 检查订单是否存在
			let order: OrderOf<T> = Orders::<T>::get(order_id).ok_or(Error::<T>::OrderNotExist)?;

			// 检查是否到了结算时间
			ensure!(!Self::is_time_to_settlement(&order)?, Error::<T>::IsTimeToSettlement);

			// 检查最小质押
			ensure!(T::MinimumVotingLock::get() <= amount, Error::<T>::VoteAmountTooLow);

			let now = frame_system::Module::<T>::block_number();
			let keep_block_num = order.create_block
				.checked_add(&order.keep_block_num).ok_or(Error::<T>::BlockNumberOverflow)?
				.checked_sub(&now).ok_or(Error::<T>::BlockNumberOverflow)?;

			// 质押
			T::Currency::reserve(&who, amount)?;
			// 插入投票信息
			Votes::<T>::try_mutate(order_id, |votes| -> DispatchResult {
				let vote = Vote {
					order_id,
					amount,
					keep_block_num,
					owner: who.clone()
				};
				votes.push(vote);
				Ok(())
			})?;
			Ok(())
		}
	}
}

impl<T: Trait> Module<T> {

	// 清理bid的reserve，和索引
	pub fn clean_order_bid(order_id: T::OrderId) {
		let bid_opt: Option<BidOf<T>> = Bids::<T>::get(order_id);
		if let Some(bid) = bid_opt {
			// 解锁之前的锁定的钱
			T::Currency::unreserve(&bid.owner, bid.price);
			Bids::<T>::remove(order_id);
		}
	}

	// 需要在Order里面增加创建订单时的区块，根据order中的keep_block_number设置检查是否到期
	// 到期则返回true，否则返回false
	fn is_time_to_settlement(order: &OrderOf<T>) -> Result<bool, DispatchError> {
		let now = frame_system::Module::<T>::block_number();
		let sub_block = now.checked_sub(&order.create_block).ok_or(Error::<T>::BlockNumberOverflow)?;
		Ok(sub_block > order.keep_block_num)
	}


	fn order_complete(
		order: &OrderOf<T>,
		bid: &T::AccountId, // 购买者
		price: BalanceOf<T>, // 最终购买价格
		_settlement: &T::AccountId // 触发完成人
	) -> dispatch::DispatchResult {
		T::Currency::transfer(
			&bid, &order.owner, price, ExistenceRequirement::KeepAlive
		)?;
		// 移除订单索引
		Orders::<T>::remove(order.order_id);
		NftOrder::<T>::remove(order.nft_id);
		let votes: Vec<VoteOf<T>> = Votes::<T>::get(order.order_id);
		Self::algorithm(&order, price, votes.clone());
		Votes::<T>::remove(order.order_id);
		// 更新nft账户索引
		NftAccount::<T>::insert(order.nft_id, bid.clone());
		Self::deposit_event(RawEvent::OrderComplete(bid.clone(), order.order_id));
		Ok(())
	}

	pub fn algorithm(
		order: &OrderOf<T>, // 最大拍卖区块数
		bid_price: BalanceOf<T>, // 购买价格
		inputs: Vec<VoteOf<T>> //质押列表
	) {
		if inputs.is_empty() {
			return
		}
		let fix_rate: U64F64 = U64F64::from_num(T::FixRate::get());
		let profit_rate: U64F64 = U64F64::from_num(T::ProfitRate::get());
		let day_block_num: u128 = T::DayBlockNum::get().saturated_into();
		let day_block_num: U64F64 = U64F64::from_num(day_block_num);
		let block_num: u128 = order.keep_block_num.saturated_into();
		let block_num: U64F64 = U64F64::from_num(block_num);
		let bid_price: u128 = bid_price.saturated_into();
		let bid_price: U64F64 = U64F64::from_num(bid_price);

		let day: U64F64 = block_num / day_block_num;
		let stock: U64F64 = bid_price * profit_rate / day * U64F64::from_num(365); // 初始股权数

		debug::warn!(
			"=>当前价格为: {}, 分成比例为: {}%, 拍卖时长: {}day, 初始股权数: {}, 固定年化: {}%",
			bid_price,
			profit_rate,
			day,
			stock,
			fix_rate
		);

		let mut is_fixed: bool = false; // 是否开启固定利率
		let mut total: U64F64 = U64F64::from_num(0.0); // 总质押数量
		let mut weight_rate: U64F64 = U64F64::from_num(0.0); // 汇率
		let mut tt: U64F64 = U64F64::from_num(0.0);
		let mut vote_res: Vec<(VoteOf<T>, U64F64)> = vec![];
		for vote in inputs {
			let amount: u128 = vote.amount.saturated_into();
			let amount: U64F64 = U64F64::from_num(amount);
			let keep_block_num: u128 = vote.keep_block_num.saturated_into();
			let keep_block_num: U64F64 = U64F64::from_num(keep_block_num);
			let vote_day: U64F64 = keep_block_num / day_block_num;

			let pre_weight: U64F64 = amount * vote_day / day; // 质押权重
			total += pre_weight;

			if !is_fixed {
				weight_rate = stock / (stock + total); // 随着质押数量的增加,逐渐变小
			}
			let t: U64F64 = pre_weight * weight_rate;
			tt += t;
			let year_rate: U64F64 = t / tt * stock / pre_weight; // 年化收益率
			if year_rate < fix_rate {
				is_fixed = true;
			}
			vote_res.push((vote, t));

			debug::warn!(
				"质押数量: {}, 质押时长: {}day, 当前汇率: {}, 当前年收益率为: {}, 此次获得的凭证为: {}/{}",
				amount,
				vote_day,
				weight_rate,
				year_rate,
				t,
				tt
			)
		}
		let profit_amount: U64F64 = profit_rate * bid_price;
		for (vote, t) in vote_res {
			T::Currency::unreserve(&vote.owner, vote.amount);
			let profit_amount: U64F64 = profit_amount / tt * t;
			let profit_amount: u128 = profit_amount.floor().to_num();
			let profit_amount: BalanceOf<T> = profit_amount.saturated_into();
			let _ = T::Currency::transfer(&order.owner, &vote.owner, profit_amount,
								  ExistenceRequirement::KeepAlive
			);
		}
	}


}