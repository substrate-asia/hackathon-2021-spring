# MANTA NODE

This repo is a fresh FRAME-based [Substrate](https://www.substrate.io/) node, forked from `substrate-developer-hub/substrate-node-templte` :rocket:
It links to [pallet-manta-dap](https://github.com/Manta-Network/pallet-manta-dap) for all Manta-APIs.
See [pallet-manta-dap/readme](https://github.com/Manta-Network/pallet-manta-dap/blob/master/README.md) for more details.

## Howto Run Manta Node

``` sh
make init
make run
```

You will need to use [manta front end](https://github.com/Manta-Network/manta-front-end) to interact with this node.

## Demo 

### Setup
1. run a Manta node locally
2. run a `manta-front-end` locally (require `node.js` with version > 12.0):
   ```sh
   git clone https://github.com/Manta-Network/manta-front-end.git
   cd manta-front-end
   yarn install
   yarn start 
   ```
   you will see an minimal front-end interface like the following:
   ![gui](https://user-images.githubusercontent.com/720571/110530713-9cab7500-80cf-11eb-9c35-261e34054c89.png)

### Step 1: Create basecoin 

Now we create a basecoin with `2000000` supply.

![step1](https://user-images.githubusercontent.com/720571/110530916-ce244080-80cf-11eb-8e8e-bf3ecadd8914.png)


### Step 2: Mint a 10 unit worth private coin 1

Here, we use pre-computed values of commitment, s, and k.
* s: `xsPXqMXA1SKMOehtsgVWV8xw9Mj0rh3O8Yt1ZHJzaQ4=`
* k: `+tMTpSikpdACxuDGZTl5pxwT7tpYcX/DFKJRZ1oLfqc=`
* commitment (`cm`): `XzoWOzhp6rXjQ/HDEN6jSLsLs64hKXWUNuFVtCUq0AA=`
![step2](https://user-images.githubusercontent.com/720571/110531644-ac778900-80d0-11eb-9a41-b18b83bb4b34.png)

you can see the newly minted private coin in the ledger:

![step2-2](https://user-images.githubusercontent.com/720571/110531694-bdc09580-80d0-11eb-8bca-b7a36897c359.png)

### Step 3: privately transfer coin 1 to coin 2

Now, we make a private transfer. This will generate a new UTXO, coin 2. We are also using pre-computed values:
* merkle_roots: `q5VhDl/WxjeemZ/2ivGmiuOTFMEazcqEFk5ESISngso=`
* old sn: `jqhzAPanABquT0CpMC2aFt2ze8+UqMUcUG6PZBmqFqE=`
* old k: `+tMTpSikpdACxuDGZTl5pxwT7tpYcX/DFKJRZ1oLfqc=`
* new k: `2HbWGQCLOfxuA4jOiDftBRSbjjAs/a0vjrq/H4p6QBI=`
* new commitment: `1zuOv92V7e1qX1bP7+QNsV+gW5E3xUsghte/lZ7h5pg=`
* encrypted transfer amount: `UkNssYxe5HUjSzlz5JE1pQ==`
* proof: `Dhs0fgdEpE1SfBGIn5HpD22YvzPZKsLKMBPwT9QRe/BcuqnQuyr0oUHb7lNS/WoIPD/H348KI+e6eMcNa2nYLN5AqH/ZmXz7p2nrwUsHJVOYnFDuH2zEAcZi0hTPTN0HEiiXtYEBmUSt52xDehRSw/yCXY6AFvlQzXvMWdXq2SF2zRh93Rs9pQyO/3e7QLyMffIMeeAbx580PsJJELPrSB9x+a99l/4z8NW0YlBUwzt90uFL1bnEcp+B1gxXjpAD`

![step3](https://user-images.githubusercontent.com/720571/110532076-3b84a100-80d1-11eb-9c7b-ab7f98350a0b.png)

### Step 4: reclaim (forfeit) coin 2 (10 unit) to public coin

Using pre-computed values.
* merkle root: `HMaIZu0QCE4s5fYiOpU3ouQE0m7PT4rBNsmMskIi50c=`
* old sn: `bwgOTJ8nNJ8phco73Zm6A8jV0ua6qsw9MtXtwyxV7cQ=`,
* old k: `2HbWGQCLOfxuA4jOiDftBRSbjjAs/a0vjrq/H4p6QBI=`,
* proof: `7+PY3Z5vL33hTY7w3HHLsvCCiICwtvQ6h6J2vt/y5ZteyJSj0LWbkwHaKlA+6/SUkKUxEyVox6bwXsakFRPrfuTfRmw2FAoVZCUzSKMqkKoFcj9WwskAnyYvnu1De7ARucNI8FFvGOhcejaPyWUu7VAH+y2iJz4irKU+vnwXqc5QKoPmA8m67Kyor4i+3PSL/tmTuVblLt8bmHjFbXhvicxdAbnKX33W36Ucg7nYOns4yC1h+ILO4llwUp4tOR6Y`

![step4](https://user-images.githubusercontent.com/720571/110533364-c4e8a300-80d2-11eb-8d35-39f95854b016.png)

Now, you succesfully reclaim coin 2 to public!

