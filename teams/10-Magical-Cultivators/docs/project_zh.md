# **Mintcraft** 项目介绍

![Logo][logo]

## 项目报告

'Mintcraft'是一个Rogue-like类游戏的区块链接入框架。[简介PPT](presentation.pdf)

### 项目背景 - What we want to do?

> 这是一个资产上链型游戏的框架

我们旨在解决以下问题：

- 如何在区块链上使用结构化或预设的游戏规则生成参数合理的随机游戏资源
- 如何平衡玩家资源和世界自生成资源的产生和消耗
- 如何构建一种机制，以支持一个同时具备上链的游戏资源和离链的中心化游戏服务的游戏，使其公平公正。

### 项目技术设计 - How we do it?

> 以下是我们对这块产品的框架设计

#### **角色行为流程**

![Activities Diagram][diagram-activities]

#### **资源循环图**

![Resources Loop][diagram-resources]

#### **模块设计图**

![Pallets Diagram][diagram-pallets]

### 项目现在做到的程度 - What we have done?

> (>.<) 由于我们兼职开发且进行 Hackathon 的时间紧张，截止到3月15日，尚未很多未完成。但我们会继续进行开发……

* ~~产品框架设计(Substrate, 阶段1)~~
* Substrate模块实现(阶段1)
  * ~~featured-assets~~
  * nft - 50%
  * actor - 40%
  * nature - 30%
  * cultivate - 0%
  * implication - 0%
  * dungeons - 0%
* 游戏 Demo(阶段1)
  * 游戏服务端 - 0%
  * 游戏前端 - 0%

### 技术难点及解决方案 - Which issues we have met?

我们早期花了不少时间对整个逻辑循环进行了可行性验证。当我们完成了整个逻辑闭环并开发着手 Substrate 模块实现时，我们遇到最麻烦的问题便是很多场景对于 Substrate 来说过于复杂了。

于是我们不得不简化整个逻辑循环让它更加更加适合基于 Substrate 的表达方式。

同时另一个问题是'NFT'并不是一个'Account'，但在我们的培养模块中，'NFT'需要像角色一样是可以被培养的。我们依然在解决这个问题，目前的解决方案是引入新的Trait来抽象一些通用的概念。

### 黑客松期间的开发工作

这是一个我们以这次黑客松活动为契机构思的全新项目，起步也比较晚，我们从三月才开始兼职开始实现。

## 项目长远规划

### 未来 6 个月的商业规划

这将是一个长期的项目。我们计划无论是否继续比赛，我们都将持续开发 'Mintcraft' 框架以及我们的游戏‘魔改修真者 Magical Cultivators’。

目前计划中以文字形式呈现的前端游戏只是这个计划的第一步，试水之作。

而下一步我们打算将它连接到 [Roblox](https://www.roblox.com/) ，在一个更大更开放的平台，呈现这块基于区块链的 Rogue-like 游戏。

那将是一个更加奇幻的世界！

### 市场定位及调研

[Rogue-like](https://zh.wikipedia.org/wiki/Roguelike) 游戏可以说是最令人上瘾的游戏类型之一。

而我们觉得它其实也是最适合区块链体验的游戏类型，因为它可以完全分割玩家数据和游戏体验这两部分。

作为核心游戏体验的死亡迷宫，可以完全由链下服务提供，其战斗产物则以链上的数据的形式进行保存。

我们非常期待能成为区块链游戏富有游戏性玩法的开端。

### 资源与运营计划

目前我们并没有额外的资源用于运营。

但我们始终坚信用 Substrate 这样次世代技术去实现一个 Rogue-like 的游戏是一件非常酷的事。

或许我们会将我们的开发过程和阶段性成果，通过上传视频（到B站）或者直播的方式给大家分享。

[logo]: logos/logo_en_small.png "logo"
[diagram-activities]: imgs/activities.png "Activities Diagram"
[diagram-resources]: imgs/resourceloop.jpg "Resources Loop"
[diagram-pallets]: imgs/pallets.jpg "Pallets Diagram"
