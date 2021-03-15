//contract specific errors
pub(crate) const VL_INVALID_AMOUNT: u8 = 1; // Amount must be greater than 0
pub(crate) const VL_NO_ACTIVE_RESERVE: u8 = 2; // Action requires an active reserve
pub(crate) const VL_RESERVE_FROZEN: u8 = 3; // Action cannot be performed because the reserve is frozen
pub(crate) const VL_CURRENT_AVAILABLE_LIQUIDITY_NOT_ENOUGH: u8 = 4; // The current liquidity is not enough
pub(crate) const VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE: u8 = 5; // User cannot withdraw more than the available balance
pub(crate) const VL_TRANSFER_NOT_ALLOWED: u8 = 6; // Transfer cannot be allowed.
pub(crate) const VL_BORROWING_NOT_ENABLED: u8 = 7; // Borrowing is not enabled
pub(crate) const VL_INVALID_INTEREST_RATE_MODE_SELECTED: u8 = 8; // Invalid interest rate mode selected
pub(crate) const VL_COLLATERAL_BALANCE_IS_0: u8 = 9; // The collateral balance is 0
pub(crate) const VL_HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD: u8 = 10; // Health factor is lesser than the liquidation threshold
pub(crate) const VL_COLLATERAL_CANNOT_COVER_NEW_BORROW: u8 = 11; // There is not enough collateral to cover a new borrow
pub(crate) const VL_STABLE_BORROWING_NOT_ENABLED: u8 = 12; // stable borrowing not enabled
pub(crate) const VL_COLLATERAL_SAME_AS_BORROWING_CURRENCY: u8 = 13; // collateral is (mostly) the same currency that is being borrowed
pub(crate) const VL_AMOUNT_BIGGER_THAN_MAX_LOAN_SIZE_STABLE: u8 = 14; // The requested amount is greater than the max loan size in stable rate mode
pub(crate) const VL_NO_DEBT_OF_SELECTED_TYPE: u8 = 15; // for repayment of stable debt, the user needs to have stable debt, otherwise, he needs to have variable debt
pub(crate) const VL_NO_EXPLICIT_AMOUNT_TO_REPAY_ON_BEHALF: u8 = 16; // To repay on behalf of an user an explicit amount to repay is needed
pub(crate) const VL_NO_STABLE_RATE_LOAN_IN_RESERVE: u8 = 17; // User does not have a stable rate loan in progress on this reserve
pub(crate) const VL_NO_VARIABLE_RATE_LOAN_IN_RESERVE: u8 = 18; // User does not have a variable rate loan in progress on this reserve
pub(crate) const VL_UNDERLYING_BALANCE_NOT_GREATER_THAN_0: u8 = 19; // The underlying balance needs to be greater than 0
pub(crate) const VL_DEPOSIT_ALREADY_IN_USE: u8 = 20; // User deposit is already being used as collateral
pub(crate) const LP_NOT_ENOUGH_STABLE_BORROW_BALANCE: u8 = 21; // User does not have any stable rate loan for this reserve
pub(crate) const LP_INTEREST_RATE_REBALANCE_CONDITIONS_NOT_MET: u8 = 22; // Interest rate rebalance conditions were not met
pub(crate) const LP_LIQUIDATION_CALL_FAILED: u8 = 23; // Liquidation call failed
pub(crate) const LP_NOT_ENOUGH_LIQUIDITY_TO_BORROW: u8 = 24; // There is not enough liquidity available to borrow
pub(crate) const LP_REQUESTED_AMOUNT_TOO_SMALL: u8 = 25; // The requested amount is too small for a FlashLoan.
pub(crate) const LP_INCONSISTENT_PROTOCOL_ACTUAL_BALANCE: u8 = 26; // The actual balance of the protocol is inconsistent
pub(crate) const LP_CALLER_NOT_LENDING_POOL_CONFIGURATOR: u8 = 27; // The caller of the function is not the lending pool configurator
pub(crate) const LP_INCONSISTENT_FLASHLOAN_PARAMS: u8 = 28;
pub(crate) const CT_CALLER_MUST_BE_LENDING_POOL: u8 = 29; // The caller of this function must be a lending pool
pub(crate) const CT_CANNOT_GIVE_ALLOWANCE_TO_HIMSELF: u8 = 30; // User cannot give allowance to himself
pub(crate) const CT_TRANSFER_AMOUNT_NOT_GT_0: u8 = 31; // Transferred amount needs to be greater than zero
pub(crate) const RL_RESERVE_ALREADY_INITIALIZED: u8 = 32; // Reserve has already been initialized
pub(crate) const LPC_RESERVE_LIQUIDITY_NOT_0: u8 = 34; // The liquidity of the reserve needs to be 0
pub(crate) const LPC_INVALID_ATOKEN_POOL_ADDRESS: u8 = 35; // The liquidity of the reserve needs to be 0
pub(crate) const LPC_INVALID_STABLE_DEBT_TOKEN_POOL_ADDRESS: u8 = 36; // The liquidity of the reserve needs to be 0
pub(crate) const LPC_INVALID_VARIABLE_DEBT_TOKEN_POOL_ADDRESS: u8 = 37; // The liquidity of the reserve needs to be 0
pub(crate) const LPC_INVALID_STABLE_DEBT_TOKEN_UNDERLYING_ADDRESS: u8 = 38; // The liquidity of the reserve needs to be 0
pub(crate) const LPC_INVALID_VARIABLE_DEBT_TOKEN_UNDERLYING_ADDRESS: u8 = 39; // The liquidity of the reserve needs to be 0
pub(crate) const LPC_INVALID_ADDRESSES_PROVIDER_ID: u8 = 40; // The liquidity of the reserve needs to be 0
pub(crate) const LPC_INVALID_CONFIGURATION: u8 = 75; // Invalid risk parameters for the reserve
pub(crate) const LPC_CALLER_NOT_EMERGENCY_ADMIN: u8 = 76; // The caller must be the emergency admin
pub(crate) const LPAPR_PROVIDER_NOT_REGISTERED: u8 = 41; // Provider is not registered
pub(crate) const LPCM_HEALTH_FACTOR_NOT_BELOW_THRESHOLD: u8 = 42; // Health factor is not below the threshold
pub(crate) const LPCM_COLLATERAL_CANNOT_BE_LIQUIDATED: u8 = 43; // The collateral chosen cannot be liquidated
pub(crate) const LPCM_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER: u8 = 44; // User did not borrow the specified currency
pub(crate) const LPCM_NOT_ENOUGH_LIQUIDITY_TO_LIQUIDATE: u8 = 45; // "There isnt enough liquidity available to liquidate"
pub(crate) const LPCM_NO_ERRORS: u8 = 46; // No errors
pub(crate) const LP_INVALID_FLASHLOAN_MODE: u8 = 47; //Invalid flashloan mode selected
pub(crate) const MATH_MULTIPLICATION_OVERFLOW: u8 = 48;
pub(crate) const MATH_ADDITION_OVERFLOW: u8 = 49;
pub(crate) const MATH_DIVISION_BY_ZERO: u8 = 50;
pub(crate) const RL_LIQUIDITY_INDEX_OVERFLOW: u8 = 51; //  Liquidity index overflows uint128
pub(crate) const RL_VARIABLE_BORROW_INDEX_OVERFLOW: u8 = 52; //  Variable borrow index overflows uint128
pub(crate) const RL_LIQUIDITY_RATE_OVERFLOW: u8 = 53; //  Liquidity rate overflows uint128
pub(crate) const RL_VARIABLE_BORROW_RATE_OVERFLOW: u8 = 54; //  Variable borrow rate overflows uint128
pub(crate) const RL_STABLE_BORROW_RATE_OVERFLOW: u8 = 55; //  Stable borrow rate overflows uint128
pub(crate) const CT_INVALID_MINT_AMOUNT: u8 = 56; //invalid amount to mint
pub(crate) const LP_FAILED_REPAY_WITH_COLLATERAL: u8 = 57;
pub(crate) const CT_INVALID_BURN_AMOUNT: u8 = 58; //invalid amount to burn
pub(crate) const LP_FAILED_COLLATERAL_SWAP: u8 = 60;
pub(crate) const LP_INVALID_EQUAL_ASSETS_TO_SWAP: u8 = 61;
pub(crate) const LP_REENTRANCY_NOT_ALLOWED: u8 = 62;
pub(crate) const LP_CALLER_MUST_BE_AN_ATOKEN: u8 = 63;
pub(crate) const LP_IS_PAUSED: u8 = 64; // Pool is paused
pub(crate) const LP_NO_MORE_RESERVES_ALLOWED: u8 = 65;
pub(crate) const LP_INVALID_FLASH_LOAN_EXECUTOR_RETURN: u8 = 66;
pub(crate) const RC_INVALID_LTV: u8 = 67;
pub(crate) const RC_INVALID_LIQ_THRESHOLD: u8 = 68;
pub(crate) const RC_INVALID_LIQ_BONUS: u8 = 69;
pub(crate) const RC_INVALID_DECIMALS: u8 = 70;
pub(crate) const RC_INVALID_RESERVE_FACTOR: u8 = 71;
pub(crate) const LPAPR_INVALID_ADDRESSES_PROVIDER_ID: u8 = 72;
pub(crate) const VL_INCONSISTENT_FLASHLOAN_PARAMS: u8 = 73;
pub(crate) const LP_INCONSISTENT_PARAMS_LENGTH: u8 = 74;
pub(crate) const UL_INVALID_INDEX: u8 = 77;
pub(crate) const LP_NOT_CONTRACT: u8 = 78;
pub(crate) const SDT_STABLE_DEBT_OVERFLOW: u8 = 79;
pub(crate) const SDT_BURN_EXCEEDS_BALANCE: u8 = 80;

#[derive(Debug, PartialEq, Eq, scale::Encode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum CollateralManagerErrors {
    NoError,
    NoCollateralAvailable,
    CollateralCannotBeLiquidated,
    CurrrencyNotBorrowed,
    HealthFactorAboveThreshold,
    NotEnoughLiquidity,
    NoActiveReserve,
    HealthFactorLowerThanLiquidationThreshold,
    InvalidEqualAssetsToSwap,
    FrozenReserve,
}
