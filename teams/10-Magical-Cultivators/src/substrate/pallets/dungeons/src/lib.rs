#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::{fmt::Debug, prelude::*};
use sp_runtime::{
	RuntimeDebug, Percent,
	traits::{
		Hash, AtLeast32BitUnsigned, Zero,
		// Saturating, CheckedSub, CheckedAdd,
	},
};
use frame_support::{
	traits::{
		Currency, ReservableCurrency,
		ExistenceRequirement::{KeepAlive},
	},
};
use codec::{Encode, Decode, HasCompact, FullCodec};
use mc_support::{
	primitives::{ DungeonReportState },
	traits::{
		ManagerAccessor, FeaturedAssets, RandomNumber, RandomHash,
	},
};

pub use pallet::*;

type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;
type AssetBalance<T> = <<T as Config>::FeaturedAssets as FeaturedAssets<<T as frame_system::Config>::AccountId>>::Balance;
type AssetAmountPair<T> = (
	<<T as Config>::FeaturedAssets as FeaturedAssets<<T as frame_system::Config>::AccountId>>::AssetId,
	AssetBalance<T>,
);

#[frame_support::pallet]
pub mod pallet {
	use frame_system::pallet_prelude::*;
	use frame_support::{
		pallet_prelude::*,
		weights::{DispatchClass, Pays},
		dispatch::DispatchResultWithPostInfo,
	};
	use super::*;

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	/// The module configuration trait.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// The overarching event type.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;

		/// The arithmetic type of dungeon identifier.
		type DungeonId: Member + Parameter + Default + Copy + HasCompact + FullCodec;

		/// The units in which we record balances.
		type Balance: Member + Parameter + AtLeast32BitUnsigned + Default + Copy;

		/// The currency mechanism.
		type Currency: ReservableCurrency<Self::AccountId>;

		/// The manager origin.
		type ManagerOrigin: EnsureOrigin<Self::Origin>;

		/// Asset Admin is outer module
		type AssetAdmin: ManagerAccessor<Self::AccountId>;

		/// Something that provides randomness number in the runtime.
		type RandomNumber: RandomNumber<u32>;

		/// Something that provides randomness hash in the runtime.
		type RandomHash: RandomHash<Self::Hash>;

		/// The featured asset module
		type FeaturedAssets: FeaturedAssets<Self::AccountId>;

		/// blocks for closing after ticket bought
		type TicketClosingGap: Get<Self::BlockNumber>;

		/// blocks for closing after playing
		type TicketPlayingGap: Get<Self::BlockNumber>;

		/// percent for asset distribution
		type AssetDistributionPercent: Get<Percent>;
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		// TODO on finalized
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// create new dungeon
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn create(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::DungeonId,
			ticket_price: BalanceOf<T>,
			provide_assets: Vec<AssetAmountPair<T>>,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::AssetAdmin::is_admin(&origin), Error::<T>::NoPermission);

			ensure!(!Dungeons::<T>::contains_key(id), Error::<T>::DungeonExists);
			let all_asset_in_using = provide_assets.iter().all(|one| T::FeaturedAssets::is_in_using(one.0));
			ensure!(all_asset_in_using, Error::<T>::AssetNotUsed);

			// create dungeon
			Dungeons::<T>::insert(id, DungeonInfo {
				ticket_price: ticket_price,
				provide_assets: provide_assets,
				report_ranks: Vec::new(),
			});

			Self::deposit_event(Event::DungeonCreated(id, ticket_price));
			Ok(().into())
		}

		/// modify dungeon price
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn modify_price(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::DungeonId,
			ticket_price: BalanceOf<T>,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::AssetAdmin::is_admin(&origin), Error::<T>::NoPermission);

			Dungeons::<T>::try_mutate(id, |maybe_dungeon| {
				let dungeon = maybe_dungeon.as_mut().ok_or(Error::<T>::UnknownDungeon)?;

				let old_ticket_price = dungeon.ticket_price;
				dungeon.ticket_price = ticket_price;

				Self::deposit_event(Event::DungeonTicketModified(id, old_ticket_price, ticket_price));
				Ok(().into())
			})
		}

		/// modify assets supply
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn modify_assets_supply(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::DungeonId,
			provide_assets: Vec<AssetAmountPair<T>>,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::AssetAdmin::is_admin(&origin), Error::<T>::NoPermission);

			Dungeons::<T>::try_mutate(id, |maybe_dungeon| {
				let dungeon = maybe_dungeon.as_mut().ok_or(Error::<T>::UnknownDungeon)?;

				dungeon.provide_assets = provide_assets;

				Self::deposit_event(Event::DungeonInfoModified(id));
				Ok(().into())
			})
		}

		/// modify final distribution
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn modify_distribution_ratio(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::DungeonId,
			report_ranks: Vec<(DungeonReportState, Percent)>,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::AssetAdmin::is_admin(&origin), Error::<T>::NoPermission);

			Dungeons::<T>::try_mutate(id, |maybe_dungeon| {
				let dungeon = maybe_dungeon.as_mut().ok_or(Error::<T>::UnknownDungeon)?;

				dungeon.report_ranks = report_ranks;

				Self::deposit_event(Event::DungeonReportRanksModified(id));
				Ok(().into())
			})
		}

		/// buy dungeon ticket
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn buy_ticket(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::DungeonId,
		) -> DispatchResultWithPostInfo {
			let who = ensure_signed(origin)?;
			ensure!(!T::AssetAdmin::is_admin(&who), Error::<T>::NoPermission);

			ensure!(Dungeons::<T>::contains_key(id), Error::<T>::UnknownDungeon);

			let dungeon = Dungeons::<T>::get(id).ok_or(Error::<T>::UnknownDungeon)?;

			// ensure ticket price
			T::Currency::reserve(&who, dungeon.ticket_price)?;

			// now
			let current_block = frame_system::Module::<T>::block_number();

			// build instance
			let ins = DungeonInstance {
				id: id,
				player: who.clone(),
				created_at: current_block,
				status: DungeonInstanceStatus::Booked{ close_due: current_block + T::TicketClosingGap::get() },
			};
			let ticket_id = T::Hashing::hash_of(&(id.encode(), &ins.player, &ins.created_at));
			// insert new instance
			DungeonInstances::<T>::insert(ticket_id, ins);

			Self::deposit_event(Event::DungeonTicketBought(id, who, ticket_id));
			Ok(().into())
		}

		/// begin a dungeon instance
		/// transfer balance, issue assets, update status
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn start(
			origin: OriginFor<T>,
			ticket_id: T::Hash,
		) -> DispatchResultWithPostInfo {
			let server = ensure_signed(origin)?;
			ensure!(T::AssetAdmin::is_admin(&server), Error::<T>::NoPermission);

			// ensure dungeon instance exists
			DungeonInstances::<T>::try_mutate_exists(ticket_id, |maybe_instance| -> DispatchResultWithPostInfo {
				let ins = maybe_instance.as_mut().ok_or(Error::<T>::UnknownInstance)?;
				let dungeon = Dungeons::<T>::get(ins.id).ok_or(Error::<T>::UnknownDungeon)?;

				// now block
				let current_block = frame_system::Module::<T>::block_number();
				// ensure current status is booked
				match ins.status {
					DungeonInstanceStatus::Booked{ close_due } => {
						ensure!(close_due > current_block, Error::<T>::InstanceIsClosed);
						// TODO 自动关闭过期的 dungeon instance
					},
					_ => return Err(Error::<T>::InstanceStatusShouldBeBooked.into()),
				};

				// Step.1 unreserve player's balance
				T::Currency::unreserve(&ins.player, dungeon.ticket_price);

				// Step.2 transfer player's balance to server
				let _ = T::Currency::transfer(&ins.player, &server, dungeon.ticket_price, KeepAlive)?;

				// Step.3 server mint asset to it self.
				for (asset_id, amount) in dungeon.provide_assets.iter() {
					T::FeaturedAssets::mint(*asset_id, &server, *amount)?;
				}

				// Step.4 set instance status
				ins.status = DungeonInstanceStatus::Started {
					server: server.clone(),
					close_due: current_block + T::TicketPlayingGap::get(),
				};

				// send started event
				Self::deposit_event(Event::DungeonStarted(ins.id, ins.player.clone(), server, ticket_id));
				Ok(().into())
			})
		}

		/// end a dungeon instance
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn end(
			origin: OriginFor<T>,
			ticket_id: T::Hash,
			result: DungeonReportState,
		) -> DispatchResultWithPostInfo {
			let who = ensure_signed(origin)?;
			ensure!(T::AssetAdmin::is_admin(&who), Error::<T>::NoPermission);

			// ensure dungeon instance exists
			DungeonInstances::<T>::try_mutate_exists(ticket_id, |maybe_instance| -> DispatchResultWithPostInfo {
				let ins = maybe_instance.as_mut().ok_or(Error::<T>::UnknownInstance)?;
				let dungeon = Dungeons::<T>::get(ins.id).ok_or(Error::<T>::UnknownDungeon)?;

				// now block
				let current_block = frame_system::Module::<T>::block_number();
				// ensure current status is started
				let server_id = match ins.status.clone() {
					DungeonInstanceStatus::Started{
						server,
						close_due,
					} => {
						// 自动关闭过期的 dungeon instance
						ensure!(close_due > current_block, Error::<T>::InstanceIsClosed);
						ensure!(server.clone() == who, Error::<T>::InstanceServerShouldBeSame);
						server
					},
					_ => return Err(Error::<T>::InstanceStatusShouldBeStarted.into()),
				};

				// Step.1 get percent by result
				let percent = match result {
					DungeonReportState::Lose => Percent::from_percent(0),
					DungeonReportState::PerfectWin => Percent::from_percent(100),
					DungeonReportState::ScoredWin(score) => score,
				};

				// Step.2 distribute asset to players according to result
				let distribute_percent = T::AssetDistributionPercent::get();
				for (asset_id, amount) in dungeon.provide_assets.iter() {
					let player_amount: AssetBalance<T> = distribute_percent.mul_ceil(percent.mul_ceil(*amount));
					let treasury_amount: AssetBalance<T> = distribute_percent.mul_ceil(*amount - player_amount);
					// FIXME 需要确保转账成功
					if !player_amount.is_zero() {
						T::FeaturedAssets::transfer(*asset_id, &server_id, &ins.player, player_amount)?;
					}
					if !treasury_amount.is_zero() {
						T::FeaturedAssets::transfer(*asset_id, &server_id, &T::AssetAdmin::get_owner_id(), treasury_amount)?;
					}
				}

				// Step.2 set instance status
				ins.status = DungeonInstanceStatus::Ended {
					server: server_id.clone(),
					report_at: current_block,
					report_state: result,
				};

				// send started event
				Self::deposit_event(Event::DungeonEnded(ins.id, ins.player.clone(), server_id, ticket_id, percent));
				Ok(().into())
			})
		}
	}

	#[pallet::storage]
	#[pallet::getter(fn dungeons)]
	/// dungeon definations
	pub(super) type Dungeons<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::DungeonId,
		DungeonInfo<BalanceOf<T>, AssetAmountPair<T>>
	>;

	#[pallet::storage]
	#[pallet::getter(fn dungeon_instances)]
	/// dungeon instances
	pub(super) type DungeonInstances<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::Hash,
		DungeonInstance<T::DungeonId, T::AccountId, T::BlockNumber>
	>;

	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId", T::Balance = "Balance", T::DungeonId = "DungeonId")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Some dungeon were created. \[dungeon_id, ticket_price\]
		DungeonCreated(T::DungeonId, BalanceOf<T>),
		/// Some dungeon's price were modified. \[dungeon_id, old_ticket_price, new_ticket_price\]
		DungeonTicketModified(T::DungeonId, BalanceOf<T>, BalanceOf<T>),
		/// Some dungeon's info were modified. \[dungeon_id\]
		DungeonInfoModified(T::DungeonId),
		/// Some dungeon's report ranks were modified. \[dungeon_id\]
		DungeonReportRanksModified(T::DungeonId),
		/// a dungeon instance ticket bought. \[dungeon_id, player_id, ticket_id\]
		DungeonTicketBought(T::DungeonId, T::AccountId, T::Hash),
		/// a dungeon started. \[dungeon_id, player_id, server_id, ticket_id\]
		DungeonStarted(T::DungeonId, T::AccountId, T::AccountId, T::Hash),
		/// a dungeon ended. \[dungeon_id, player_id, server_id, ticket_id, score\]
		DungeonEnded(T::DungeonId, T::AccountId, T::AccountId, T::Hash, Percent),
	}

	#[pallet::error]
	pub enum Error<T> {
		NoPermission,
		DungeonExists,
		AssetNotUsed,
		UnknownDungeon,
		UnknownInstance,
		InstanceIsClosed,
		InstanceStatusShouldBeBooked,
		InstanceStatusShouldBeStarted,
		InstanceServerShouldBeSame,
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, Default)]
pub struct DungeonInfo<
	Balance: Encode + Decode + Clone + Debug + Eq + PartialEq,
	AssetAmountPair,
> {
	/// The balance
	ticket_price: Balance,
	provide_assets: Vec<AssetAmountPair>,
	report_ranks: Vec<(DungeonReportState, Percent)>,
}

/// The status of a dungeon instance
#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub enum DungeonInstanceStatus<AccountId, BlockNumber> {
	Booked {
		close_due: BlockNumber,
	},
	Started {
		server: AccountId,
		close_due: BlockNumber,
	},
	Ended {
		server: AccountId,
		report_at: BlockNumber,
		report_state: DungeonReportState,
	},
	Closed,
}

/// The info of a dungeon instance
#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug)]
pub struct DungeonInstance<
	DungeonId: Encode + Decode + Clone + Debug + Eq + PartialEq,
	AccountId: Encode + Decode + Clone + Eq + PartialEq,
	BlockNumber: Encode + Decode + Clone + Eq + PartialEq,
> {
	/// the id of dungeon
	id: DungeonId,
	player: AccountId,
	created_at: BlockNumber,
	status: DungeonInstanceStatus<AccountId, BlockNumber>,
}

// The main implementation block for the module.
impl<T: Config> Pallet<T> {
	// Public immutables
	// TODO
}
