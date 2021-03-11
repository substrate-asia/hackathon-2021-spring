
### the work flow of Parallel 
![text](../images/work_flow_of_Parallel.png)


### the process of liquidation
- Auto trigger in OCW
- Iterate borrowers' account and fetch each Currency Collateral one by one
- Calculate liquation threshold: liquidate limit =  Collateral currency * current price * liquation ratio
- Fetch each currency's debt position, such as DAI\USDC
- Compare debt position and liquation threshold
- If debt position > liquidate limit, trigger liquidation
- Only liquation pool can execute liquidation
- Every time we can only liquidate 50% of debt position, until debt position < liquidate limit 
- The Collateral token will be liquidated at 90 percent of current market price
- the 10 percent will be incentive for the liquidator and punishment for the debtor

