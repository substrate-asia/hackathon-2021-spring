Manta Network is the first privacy-preserving DeFi stack powered by zkSNARK. 
It includes the Decentralized Anonymous Payment (DAP) and Decentralzied Anonymous eXchange (DAX). 
Decentralized Anonymous Payment (DAP) is a decentralized anonymous payment scheme for Polkadot and Parachain assets (including wrapped assets and stablecoins). 
Decentralized Anonymous eXchange (DAX) is a decentralized anonymous exchange scheme based on AMM and zkSNARK.

### Overview

[Manta Network](www.manta.network) team aims to develop a private preserving decentralized exchange on Polkadot eco-system using zkSNARK. Below is an overview of Manta platform:

![image of manta-platform](https://github.com/Manta-Network/Manta-Documentations/raw/main/manta-platform.png)

The cryptographic construction paper can be found [here](https://github.com/Manta-Network/Manta-Documentations/blob/main/manta-whitepaper.pdf). 
An abstracted work flow is also available [here](https://github.com/Manta-Network/Manta-Documentations/blob/main/manta_workflow.pdf).
Below is the Manta architecture:

    ----------------------------------------------------
    | Decentralzied Anonymous eXchange (DAX)           |  
    ----------------------------------------------------
    | Decentralized Anonymous Payment (DAP)            |  <---- W3F open grants program receipent
    ----------------------------------------------------
    | Polkadot and Parachain Assets (e.g stable coins) |
    ----------------------------------------------------

The details of Manta DAP and DAX schemes can be found section 3, and section 4 of 
[Manta White Paper](https://github.com/Manta-Network/Manta-Whitepaper/blob/main/manta-whitepaper.pdf). It will be based on the following cryptographic primitives:
* A statiscally-hidding non-interative commitment scheme, we are planning to use Pedersen hash in the actual construction.
* zkSNARK, we are planning to use [arkworks snark construction](https://github.com/arkworks-rs/snark) based on Groth16.
* Public key encryption, we are using a variant of the ephemral Diffie-Hellman system.

### Project Details 

#### Manta DAP

Manta DAP has support two kinds transactions:
* `tx_mint`: mint private coins from public coins (base coins).
* `tx_transfer`: transfer private coins to private/public coins.

(Please see section 3 of [the white paper](https://github.com/Manta-Network/Manta-Whitepaper/blob/main/manta-whitepaper.pdf) for more details.)

##### Mint private coins from base coins

To mint a new private coin, a user `u` needs to initiate a coin minting transaction
`tx_mint` with the deposit of base coin, more specically:
1. `u` samples a random number, which is a secret value that determines the private coins serial number (Note: `tx_mint` didn't include this number).
2. `u` commits her public key `a_pk`, the value of the coin `v`, and the random secret `s` that she sampled in the last step in a two stage commitments.
3. `u` thus mint a private coin and only put the value, the first stage commitment, the random secret for the second stage commitment, and the final commitment.
4. The ledger verifies that the `u` indeed deposits base coin of value `v` and add the final commitment to the merkle tree that represent ledger state.

##### Transfer private coins

Private coins can be spent and transferred by `tx_transfer`, which takes a set of input private coins to be consumed, and transfers their total value to a set of output coins: which could be either private or public.

To transfer a private coin, a user need to provide a zero knowledge proof of she knows 
the old coins, new coins, and the secret key of old coin such that:
1. both the new coins and old coins are well formed
2. the address secret key matches the public key
3. the old coin's commitment appears as a leaf of the merkle tree representing ledger state
4. The set of old coins and the set of new coins have the same total value (minus transaction fee).

The new coin will be posted on chain using public key encryption.

#### Manta DAX

Manta Decentralized Anonymous eXchange scheme is based on zkSNARK and AMM. The overall design intuition is that the ledger maintains `x*y = k` (or using some more sophiscated curve) invariant for an exchange pair. The validation logic requires that trader provide an zero-knowledge proof of the fulfillment of this invariant after trading. Below is a simplified architecture of Manta DAX:

<img src="https://github.com/Manta-Network/Manta-Documentations/raw/main/manta-workflow.png" width="800">

(Please see section 4 of [the white paper](https://github.com/Manta-Network/Manta-Documentations/blob/main/manta-whitepaper.pdf)  and
the [workflow](https://github.com/Manta-Network/Manta-Documentations/blob/main/manta_workflow.pdf)
for more details.)

## Additional Information :heavy_plus_sign: 

### Achievement so far:
* Tech design completed
* Manta-DAP POC implementation complete
    * Manta-DAP on a local node (see demo)

