#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://substrate.dev/docs/en/knowledgebase/runtime/frame>
use frame_support::{dispatch::DispatchResultWithPostInfo, pallet_prelude::*};
use frame_system::pallet_prelude::*;
use sp_std::vec::Vec;
use sp_runtime::{traits::{AtLeast32BitUnsigned,CheckedAdd, Bounded, One, Zero}};
pub use pallet::*;

mod types;

pub use types::{VoteOption,VotingNum};//ProposalInfo,

#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub struct ProposalInfo<T:Config>{
	pub (crate) sponsor : T::AccountId,
    pub (crate) id : T::ProposalIndex,
    pub (crate) title : Vec<u8>,
    pub (crate) OptionA: Vec<u8>,
    pub (crate) OptionB: Vec<u8>,
    pub (crate) dec : Vec<u8>,
    pub (crate) VoteNum : VotingNum,
}



#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
	use super::*;

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config + core::fmt::Debug{
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
		type ProposalIndex: Parameter + AtLeast32BitUnsigned + Bounded + Default + Copy + Encode +Decode ;
		
		
	}
	
	// impl From<ProposalIndex> for u64 {
	// 	fn from(item: ProposalIndex) -> Self {
	// 		item
	// 	}
	// }
	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	#[pallet::storage]
	#[pallet::getter(fn proposal)]
	pub type Proposal<T: Config> = StorageMap<_, Blake2_128Concat, T::ProposalIndex, ProposalInfo<T>, OptionQuery>;

	#[pallet::storage]
	#[pallet::getter(fn next_index)]
	pub type NextIndex<T: Config>  = StorageValue<_, T::ProposalIndex, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn all_proposal_index)]
	pub type AllProposalIndex<T: Config> = StorageValue<_, Vec<T::ProposalIndex>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn accountid_proposal)]
	pub type AccountIdProposal<T: Config> = StorageDoubleMap<_, Blake2_128Concat, T::AccountId, Blake2_128Concat, T::ProposalIndex , VotingNum, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn proposal_result)]
	pub type ProposalResult<T:Config> = StorageMap<_, Blake2_128Concat, T::ProposalIndex, VoteOption, OptionQuery>;
	
	#[pallet::storage]
	#[pallet::getter(fn accountid_created_proposal)]	
	pub type AccountIdCreatedProposal<T:Config> = StorageMap<_, Blake2_128Concat, T::AccountId, Vec<T::ProposalIndex>, ValueQuery>;

	#[pallet::genesis_config]
	#[derive(Default)]
	pub struct GenesisConfig;

	#[pallet::genesis_build]
	impl<T: Config> GenesisBuild<T> for GenesisConfig {
	 	fn build(&self) {
			let init: T::ProposalIndex = Zero::zero();
			NextIndex::<T>::put(init);
		}
	}
	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		SomethingStored(u32, T::AccountId),

		ProposalCreated(T::AccountId, T::ProposalIndex, ProposalInfo<T>),

		VoteHappend(T::AccountId, T::ProposalIndex, u64, VoteOption, ProposalInfo<T>),
	
		ProposalResult( T::ProposalIndex, VoteOption),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		
		ProposalOverFlow,

		ProposalMissing,

		VoteNumOverflow,

		NotSponsor,

	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T:Config> Pallet<T> {
		

		#[pallet::weight(0 + T::DbWeight::get().reads_writes(1,4))]
		pub fn proposal_set(origin: OriginFor<T>,title: Vec<u8>, OptionA:Vec<u8> ,OptionB:Vec<u8>, description:Vec<u8>)
		-> DispatchResultWithPostInfo {
			let who = ensure_signed(origin)?;

			let Index = NextIndex::<T>::get();

			NextIndex::<T>::put( Index.checked_add(&One::one()).ok_or(Error::<T>::ProposalOverFlow)? );

			let new_proposal = ProposalInfo{
				sponsor : who.clone(),
				id : Index,
				title : title,
				OptionA : OptionA,
				OptionB : OptionB,
				dec : description,
				VoteNum : Default::default(),
			};

			AccountIdCreatedProposal::<T>::mutate(&who, |ProposalVec|{
				(*ProposalVec).push(Index);
			} );

			Proposal::<T>::insert( Index, new_proposal.clone() );

			AllProposalIndex::<T>::append(Index);

			Self::deposit_event(Event::ProposalCreated(who,Index,new_proposal));

			Ok(().into())

		}

		#[pallet::weight(0 + T::DbWeight::get().reads_writes(1,2))]
		pub fn vote(origin: OriginFor<T>, ProposalIndex: T::ProposalIndex, VoteOption:VoteOption, VoteNum: u64) 
		-> DispatchResultWithPostInfo{
			let who = ensure_signed(origin)?;

			let mut VoteInfo = Proposal::<T>::get(ProposalIndex).ok_or(Error::<T>::ProposalMissing)?;

			if VoteOption == VoteOption::A{
				VoteInfo.VoteNum.A = VoteInfo.VoteNum.A.checked_add(VoteNum).ok_or(Error::<T>::VoteNumOverflow)?;
		
			}
			else{
				VoteInfo.VoteNum.B = VoteInfo.VoteNum.B.checked_add(VoteNum).ok_or(Error::<T>::VoteNumOverflow)?;
			}

			Proposal::<T>::insert(ProposalIndex, VoteInfo.clone() );

			AccountIdProposal::<T>::insert( &who, ProposalIndex, VoteInfo.VoteNum.clone());

			Self::deposit_event(Event::VoteHappend(who,ProposalIndex,VoteNum,VoteOption,VoteInfo.clone()));

			Ok(().into())

		}

		#[pallet::weight(0 + T::DbWeight::get().reads_writes(1,1))]
		pub fn uploadresult(origin: OriginFor<T>, ProposalIndex: T::ProposalIndex, Result:VoteOption,)
		-> DispatchResultWithPostInfo{
			let who = ensure_signed(origin)?;

			let mut VoteInfo = Proposal::<T>::get(ProposalIndex).ok_or(Error::<T>::ProposalMissing)?;

			ensure!(VoteInfo.sponsor == who.clone(),Error::<T>::NotSponsor);

			ProposalResult::<T>::insert(ProposalIndex, Result.clone());

			Self::deposit_event(Event::ProposalResult(ProposalIndex,Result));

			Ok(().into())
		}
	}
}
