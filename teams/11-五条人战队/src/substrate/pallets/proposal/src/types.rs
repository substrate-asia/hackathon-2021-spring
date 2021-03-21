use codec::{Encode, Decode};
use sp_runtime::RuntimeDebug;
use sp_runtime::traits::Zero;
use sp_std::vec::Vec;



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub struct VotingNum{
    pub (crate) A :u64,
    pub (crate) B :u64,
}
impl  Default for VotingNum{
	fn default() -> Self{
		VotingNum{
			A: 0,
			B: 0,
		}
	}
	
}

#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub enum VoteOption{
    A,
    B,
}

