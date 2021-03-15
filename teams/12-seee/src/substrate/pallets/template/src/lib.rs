#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// https://substrate.dev/docs/en/knowledgebase/runtime/frame

use frame_support::{decl_module, decl_storage, decl_event, decl_error,  ensure, StorageMap};
use frame_system::ensure_signed;
use sp_std::vec::Vec;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;



/// 通过指定它所依赖的参数和类型来配置模块。
pub trait Config: frame_system::Config {
    /// Because this pallet emits events, it depends on the runtime's definition of an event.
    type Event: From<Event<Self>> + Into<<Self as frame_system::Config>::Event>;
}


//  模块的 runtime 存储项目。
// https://substrate.dev/docs/en/knowledgebase/runtime/storage
decl_storage! {
    trait Store for Module<T: Config> as TemplateModule {
        /// The storage item for our proofs.
        /// 它将证明( 证明由 cid+mkroot 组合成) 映射到提出声明的用户以及声明的时间。
		/*
		   proof: Vec<u8>  =  cid + "_" + mkroot ;  //like："f8664bcc1760f9973ae3741b2ac6fc3de85fd7fd2ac7cc558593ef9f95ef32f7_14267432866602418070" 
		*/
        Proofs: map hasher(blake2_128_concat) Vec<u8> => (T::AccountId, T::BlockNumber);
    }
}

// 当做出重要更改时，模块通过事件通知用户。
// 事件文档应该以提供参数描述名称的数组结尾。
// https://substrate.dev/docs/en/knowledgebase/runtime/events
decl_event! {
    pub enum Event<T> where AccountId = <T as frame_system::Config>::AccountId , BlockNumber = < T as frame_system::Config>::BlockNumber {
        /// Event emitted when a proof has been claimed. [who, claim]
        ClaimCreated(AccountId, Vec<u8>, BlockNumber) ,
        /// Event emitted when a claim is revoked by the owner. [who, claim]
        ClaimRevoked(AccountId, Vec<u8>),
    }
}

// 错误通知：出错时对用户进行通知
decl_error! {
    pub enum Error for Module<T: Config> {
        /// The proof has already been claimed.
        ProofAlreadyClaimed,
        /// 该证明不存在，因此它不能被撤销
        NoSuchProof,
        /// 该证明已经被另一个账号声明，因此它不能被撤销
        NotProofOwner,
    }
}

// 可调用函数允许用户与模块交互并调用状态更改。
// 这些函数将实现为“Extrinsics”，它经常被拿来和交易做对比。
// 可调用函数必须标注 Weight 并返回调用结果。
decl_module! {
    pub struct Module<T: Config> for enum Call where origin: T::Origin {
        // Errors must be initialized if they are used by the pallet.
        type Error = Error<T>;

        // 事件必须被初始化，如果它们被模块所使用。
        fn deposit_event() = default;

        /// 允许用户对未声明的证明拥有所有权
        #[weight = 10_000]
        fn create_claim(origin, proof: Vec<u8>) {
            // 检查 extrinsic 是否签名并获得签名者
            // 如果 extrinsic 未签名，此函数将返回一个错误。
            // https://substrate.dev/docs/en/knowledgebase/runtime/origin
            let sender = ensure_signed(origin)?;

            // 校验指定的证明是否被声明
            ensure!(!Proofs::<T>::contains_key(&proof), Error::<T>::ProofAlreadyClaimed);

            // 从 FRAME 系统模块中获取区块号.
            let current_block = <frame_system::Module<T>>::block_number();

            // 存储证明：发送人与区块号
            Proofs::<T>::insert(&proof, (&sender, current_block));

            // 声明创建后，发送事件
            Self::deposit_event(RawEvent::ClaimCreated(sender, proof, current_block));
        }

        /// 允许证明所有者撤回声明
        #[weight = 10_000]
        fn revoke_claim(origin, proof: Vec<u8>) {
            //  检查 extrinsic 是否签名并获得签名者
            // 如果 extrinsic 未签名，此函数将返回一个错误。
            // https://substrate.dev/docs/en/knowledgebase/runtime/origin
            let sender = ensure_signed(origin)?;

            // 校验指定的证明是否被声明
            ensure!(Proofs::<T>::contains_key(&proof), Error::<T>::NoSuchProof);

            // 获取声明的所有者
            let (owner, _) = Proofs::<T>::get(&proof);

            // 验证当前的调用者是证声明的所有者
            ensure!(sender == owner, Error::<T>::NotProofOwner);

            // 从存储中移除声明
            Proofs::<T>::remove(&proof);

            // 声明抹掉后，发送事件
            Self::deposit_event(RawEvent::ClaimRevoked(sender, proof));
        }
    }
}
