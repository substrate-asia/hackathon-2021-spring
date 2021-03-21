# Intro of **Mintcraft**

![Logo][logo]

## Project Summary

'Mintcraft' will be a blockchain framework for rogue-like games.
[IntroPDF](presentation.pdf)

### Background - What we want to do?

> This is a framework for building a 'assets-on-chain' rogue-like game.

We want to resolve these problems:

* How to generate random resources with measured attributes under any structured or preset game rules on blockchains
* How to balance the production and consumption of players' resources and world auto-generated resources
* How to build a mechanism to support a fair and well-balanced game with on-chain resources and off-chain core gameplay provided by centralized game service

### Design - How we do it?

> The following diagrams shows the mechanism.

#### **Activities Diagram**

![Activities Diagram][diagram-activities]

#### **Resources Loop**

![Resources Loop][diagram-resources]

#### **Pallets Diagram**

![Pallets Diagram][diagram-pallets]

### Schedule - What we have done?

> (>.<) Too much work to be done, but we are a little too late.

* ~~Framework design(Substrate, Phase 1)~~
* Pallets implementation(Phase 1)
  * ~~featured-assets~~
  * nft - 50%
  * actor - 40%
  * nature - 30%
  * cultivate - 0%
  * implication - 0%
  * dungeons - 0%
* Demo Game(Phase 1)
  * GameServer - 0%
  * Frontend - 0%

### Problems and Solutions - Which issues we have met?

After we completed the closed loop of the entire game logic, we started to implement Substrate's code based on our early design.

Then we met the biggest problem, many scenarios are too complicated for Substrate. We have to simplify loop model let it suitable for Substrate.

The second problem we met is that 'NFT' is not a 'Account'. But in the cultivate pallet, we want to cultivate 'NFT' as a 'Actor'. This problem is still under resolving, our solution is introducing a new trait for 'Actor' and 'NFT'(working in progress).

### Since Hackathon

This is a brand new project for this hackation season, we have done all these jobs part-time since March.

## Project Vision

### Business plan in next 6 months

We will continue to develop the Mintcraft framework and our game 'Magical Cultivators'.The demo 'word' game is the first step.

The next step is connecting with [Roblox](https://www.roblox.com/) and building a graphic game!.

It will be a fantasy world!

### Marketing and Researchs

[Rogue-like](https://en.wikipedia.org/wiki/Roguelike) game is a type of addictive game category.

We can say it is the most suitable game category for blockchain since the separation of player’s items and 'Procedural death labyrinths'.

As the core game experience, the 'Procedural death labyrinths' can be completely provided by off-chain services, and its battle loots are stored in the form of on-chain data.

We are very looking forward to becoming the beginning of blockchain games with rich gameplay.

### Resources and Operation Plans

For now, No extra resources.

But we think it is so cool to build a rogue-like game with some impressive techology like Substrate.

May be posting our dev progress at some video sharing or live broadcasting website is a good idea.

[logo]: logos/logo_en_small.png "logo"
[diagram-activities]: imgs/activities.png "Activities Diagram"
[diagram-resources]: imgs/resourceloop.jpg "Resources Loop"
[diagram-pallets]: imgs/pallets.jpg "Pallets Diagram"
