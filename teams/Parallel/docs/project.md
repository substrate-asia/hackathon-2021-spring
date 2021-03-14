## The work flow of Parallel

### Project background

Parallel finance aims to be the first and largest lending protocol on top of polkadot ecosystem. We notice that DOT and KSM token holders have substantial demand to utilize decentralized lending protocol which enables users to get cash liquidity and add leverage. However, we couldn't find a matured solution on the market. For the next step, we will provide "double interest" from both staking DOT and earning interests from deposits. 

### Technology

The loans protocol get inspired by compound protocol and the blockchain is developed on substrate 3.0. 
We get tons of benefit from substrate for its efficient and scalable. The following is the key design:

![text](../images/work_flow_of_Parallel.png)

##### Storage
```
/// Container for borrow balance information
pub struct BorrowSnapshot {
    pub principal: Balance,
    pub interest_index: u128,
}

/// Total number of collateral tokens in circulation
TotalSupply = StorageMap<CurrencyId, Balance>

/// Total amount of outstanding borrows of the underlying in this market
TotalBorrows = StorageMap<CurrencyId, Balance>

/// Mapping of account addresses to outstanding borrow balances
AccountBorrows = StorageDoubleMap<CurrencyId,T::AccountId,BorrowSnapshot>

/// Mapping of account addresses to collateral tokens balances
AccountCollateral = StorageDoubleMap<CurrencyId,T::AccountId,Balance>

/// Accumulator of the total earned interest rate since the opening of the market
BorrowIndex = StorageMap<CurrencyId, u128>

/// exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply    
ExchangeRate = StorageMap<CurrencyId, u128>
```

##### Calls
```
// Sender supplies assets into the market and receives cTokens in exchange
mint(who: &T::AccountId, currency_id: &CurrencyId, mint_amount: Balance)

// Sender redeems cTokens in exchange for the underlying asset
redeem(who: &T::AccountId, currency_id: &CurrencyId, redeem_amount: Balance)

// Sender borrows assets from the protocol to their own address
borrow(borrower: &T::AccountId, currency_id: &CurrencyId, borrow_amount: Balance)

// Sender repays their own borrow
repay_borrow(borrower: &T::AccountId, currency_id: &CurrencyId, repay_amount: Balance)

// The sender liquidates the borrowers collateral and the collateral seized is transferred to the liquidator
liquidate_borrow_internal(liquidator: T::AccountId, borrower: T::AccountId, liquidate_token: CurrencyId, repay_amount: Balance, collateral_token: CurrencyId)

// Sender stakes DOTs to the validator and receives xDOTs in exchange
stake_internal(who: &T::AccountId, amount: Balance)

// Sender redeems DOTs from staking using the xDOTs
unstake_internal(who: &T::AccountId, amount: Balance)
```

##### The process of Liquidation
-   Auto trigger in OCW
-   Iterate borrowers' account and fetch each Currency Collateral one by one
-   Calculate liquation threshold: liquidate limit = Collateral currency _ current price _ liquation ratio
-   Fetch each currency's debt position, such as DAI\USDC
-   Compare debt position and liquation threshold
-   If debt position > liquidate limit, trigger liquidation
-   Only liquation pool can execute liquidation
-   Every time we can only liquidate 50% of debt position, until debt position < liquidate limit
-   The Collateral token will be liquidated at 90 percent of current market price
-   the 10 percent will be incentive for the liquidator and punishment for the debtor

### Key Terms

-   **Underlying Asset**: The assets provided by users
-   **cToken**: After the collateral of underlying assets, the system will return a certain amount of cToken to the user according to the exchange rate
-   **Exchange Rate**: The exchange rate between cToken and the underlying assets. When no one deposits assets to earn interest, there will be an initial Exchange rate, and the exchange rate will continue to increase over time
-   **Utilization Rate**: The utilization rate of cash
-   **Supply Rate**: The calculation of the supply rate requires the borrowing rate to be obtained first. Like the borrowing rate, it is calculated once for each block, and the lender in the same block obtains the same lending rate for the same asset
-   **Borrow Rate**: Borrow rate is affected by utilization rate
-   **Collateral Factor**: For different assets, there are different collateral factors. The range of the collateral factor is 0-1, which represents the ratio of the value of the user's collateral asset to the available loan. When it is zero, it means that this type of asset cannot be used as collateral to borrow other assets.
-   **Reserve**: A part of the interest income will be retained as a reserve for the currency. This retained part is determined by the `Reserve Factor`, and the reserve factor is between 0 and 1.
-   **Liquidation**: Liquidation means that when the value of the collateral assets is less than the value of the loan, the liquidator can replace part of the repayment of the liquidated person. Currently, it can repay up to 50% at a time, and the liquidator can obtain the collateral assets of the liquidated person. A certain percentage of cToken is rewarded.
-   **Close Factor**: During the liquidation process, the liquidator can help the lender to pay off the maximum debt ratio, between 0 and 1, currently 50%. This factor can be called continuously until the user's loan order is in a safe state.
-   **Liquidation Incentive**: liquidators get some rewards. For example: 8%.

### Mathematical formula

Total borrowing _ borrowing interest rate = total deposit _ deposit interest rate

> Borrower pays depositor's interest

1. Utilization Rate = Total Borrows / (Total Cash + Total Borrows − Total Reserves)
2. Supply Interest Rate = Borrowing Interest Rate ∗ Utilization Rate ∗ (1 − Reserve Factor)
3. Standard Borrow Interest Rate = Multiplier ∗ Utilization Rate + Base Rate
4. Jump Borrow Interest Rate = Multiplier ∗ min(Utilization Rate, Kink) + Jump Multiplier ∗ max(0, Utilization Rate − Kink) + Base Rate

### Current Progress


### Challenge and Solution


### References

-   [Compound WhitePaper](https://compound.finance/documents/Compound.Whitepaper.pdf)
-   [Compound，区块链银行运作原理](https://juejin.cn/post/6844903774620745742#part-2)
-   [Understanding Compound protocol's interest rates](https://ian.pw/posts/2020-12-20-understanding-compound-protocols-interest-rates)
-   [COMPOUND 这种理财到底是什么？](http://baijiahao.baidu.com/s?id=1670026342401380785)
-   [原力研究院丨 Compound：货币市场协议（中文白皮书）](https://www.chainnews.com/articles/465280458982.htm)
