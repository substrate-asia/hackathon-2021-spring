## Demo Day 演示队伍注意事项

每一队伍演示时间为 6 分钟，然后会有 2 分钟评委们提问及点评。评委们根据以下维度打分：

1. 产品完成度
2. 技术难题
3. 商业价值
4. 创新性
5. 用户体验

演示时讲个好故事，所以尽量演示：

1. 项目源起，背后的市场应用，现在做到什么程度，未来半年到一年有什么发展计划。
2. 在黑客松期间完成的功能流程，因为你们都已录制了演示视频，可把视频关键部份放在演示档案里。在台上作产品视频演示 + 你们讲解

我看到很多团队从他们的 `project.md` 及 `presentation.pdf` 都已经有很好基础去作演示了。最后祝大家好运。

## 出线至 Demo Day 团队 (2021-03-18 更新)

1. 01-Web3Games
2. 02-Decoder
3. 03-VoneWin
4. 04-NFTMart
5. 05-Blocktree
6. 06-Uniarts
7. 07-PolkaName
8. 08-subdao-network
9. 09-Apron-Network
10. 10-Magical-Cultivators
11. 11-五条人战队
12. 13-二次方工场
13. 14-DeeperNetwork
14. 15-Hashii
15. 17-Dodo-dex
16. 19-OAK-Foundation
17. 22-Parallel
18. 24-Ares-Enthusiasts
19. 26-InkBridge
20. 30-SkyePass
21. 33-Manta

---

- 截止报名时间点： **2 月 11 日 23:59**
- 截止提交参赛项目时间点： **3 月 15 日 23:59**

- [报名链接](https://shimo.im/forms/gphHCQHpkXYcwKGP/fill)
- [参赛类别](./docs/categories.md)

## 项目提交及评审流程 (2021-03-15 更新)

1. 由即日起，fork 这个代码仓库，到你们团队成员 repo 里。

2. 先在 `teams` 内生成一个目录，以你们团队名称命名，里面先放个空档案，或 readme 简单介绍团队。提交一个 PR 进来。目的是预留一个目录作为你们团队空间。**注意我们会把目录改名，在团队名称前加个编号。请 pull 下来。**

3. 之后，所有参赛项目相关代码都放在你们的团队名称里的目录里进行。可以这种形式存放：

    ```
    teams
      L 01-撒亚人战队        // 团队目录名称
        L src
          L substrate       // substrate 相关代码
          L ui              // 前端相关代码
          L 。。。           // 其他档案
        L docs              // 这里放所有文档，项目资料，规划，demo 链接, ppt (链接)
        L 。。。其他档案
    ```

4. 3月15日 时，提交一个 PR 进来本 repo 里，团队只可改修改他们目录里的档案。这样也可保持各团队们的参赛项目直到的保密性直到 3月15日。

5. 我们 3月16日 凌晨会 merge PRs。海外评委们会以 3月16日 前最后一个 PR 结果来打分。

6. 3月17日 中午 12:00 会给出初选名单，邀请出线团队出席 Demo Day。结果会在本网站公布。邀请通知会由工作人员另外发给项目联络人。我们会
跟据 1) 完整性，2) 技术难度，3) 商业价值，4) 创新性，5) 用户体验 五个维度评分。

7. 3月18日 中午 12:00 各团队联络人确认工作人员 3月20-21日 能否出席 Demo Day。

8. 3月21日 Demo Day 当天前半部分作复选。评委们分成 2-3 小组，出线队伍分到这些小组给评委团审核。每队有约 8 分钟时间演示及约 2 分钟点评时间。每个评委小组选出约 3 支队伍。

9. 3月21日 Demo Day 当天后半部分，最终出线队伍 (约 6 - 9 支队伍) 会在台上把项目展示给所有评委和现场观众，每队展示时间 10 分钟。最终选出一等奖，二等奖，三等奖，及最受开发者欢迎奖。

## 提交参赛项目信息 (2021-03-10 更新)

**3月15日** 最终提交参赛项目资料，用作给海外评委作初选审核。请包括以下信息：

  1. 必须：项目完整代码，放在 `团队目录/src/` 目录里。需要是能单独跑起来的项目。不能是要让评委另外 git clone 其他项目代码来运行。
  2. 必须：队员信息，包含参赛者名称 及 github 帐号。(工作人员此时应有团队联络人微信)。放在 `团队目录/docs/team.md` 里。
  3. 必须：项目报告，包含以下部分：

     - 项目背景/原由/要解决的问题
     - 项目技术设计
     - 项目现在做到的程度
     - 项目遇到的技术难点 及 解决方案
     - 项目如果报名时已经做到一定高度 (之前已经开始做)，请列点说明在黑客松期间 (2月1日 - 3月15日) 所完成的事项/开发工作。

     所有信息，必须有英文，放在 `团队目录/docs/project.md` 里。

  4. 必须：项目长远规划，可包含：

     - 未来 6 个月的商业规划
     - 市场定位及调研
     - 现在拥有的资源及项目运营到什么程度

     所有信息，必须有英文，放在 `团队目录/docs/prospect.md` 里。

  5. 必须：一段不长于 **8 分钟** 的产品 DEMO 展示视频, 命名为 `团队目录/demo.mp4`, 可以的话用英文演示。不方便的话，请把中文讲话内容翻译到英文，放在 `团队目录/docs/script.md` 里。

  6. 可选：项目 ppt, 以 pdf 形式储存。必须有英文。放在 `团队目录/docs/presentation.pdf` 里。这档案不一定要和 Demo Day 当天讲的一样。

请注意：

- 参赛作品若出现剽窃其他作品行为，取消参赛资格。
- 作品初步提交时间需在规定时间内（3月15日 00:00 - 23:59），其他时间提交无效。

## Workshop 及 Office Hour 时间表

|日期     | 类别 | 主讲者 | 事项 |
|--------|------|------|-------|
|2月7日  | Office Hour | Jimmy (Parity) | 答疑 |
|2月8日  | Workshop[技术] | Jimmy (Parity) | 参赛任务涉及到的Substrate技术领域和内容 |
|2月18日 | Workshop[技术] | 陈锡亮 (Acala) | 如何利用 ORML 实现多币种支持和 NFT |
|2月21日 | Office Hour | Junius (Parity) | 答疑 |
|2月23日 | Workshop[技术] | 吴逸飞 | Offchain Workers 入门 |
|2月26日 | Workshop[技术] | Aten (Patract Labs) | 如何更轻松的开发 WASM 合约 |
|2月28日 | Office Hour | Maggie (Parity) | 答疑 |
|3月3日  | Workshop[技术] | 郭斌 | 如何在 ARM 架构下运行 Substrate |
|3月7日  | Office Hour | Kaichao (Parity) | 答疑 |
|3月9日  | Workshop[生态] | SNZ | 如何选择波卡生态的投资赛道 |
|3月14日 | Office Hour | Jimmy (Parity) | 答疑 |
|3月15日 | Workshop[生态] | 肖晓 (Hashkey) | 投资波卡生态项目的5个纬度 |
|3月17日 | Office Hour | Junius (Parity) | 答疑 |
|3月18日 | Workshop[生态] | Helena (Parity) | Parity 与 Web3 基金会将如何支持开发者加入波卡生态 |

- Workshop 及 Office Hour 为上述日期的 19:00 - 20:00 (UTC +8 / 中国时间)
- 到这里 [实时收听 Workshop 及 Office Hour](https://parity.link/asia-hackathon-wo) (用[腾讯会议](https://meeting.tencent.com/))
- 到我们 [B 站频道](https://space.bilibili.com/67358318/channel/detail?cid=168675) 观看过往录播

## 官方宣发

1. [首届 Parity 官方 Substrate 开发者黑客马拉松报名开始](./docs/01-announcement.md)
2. [Polkadot Hackathon 豪华评审团19位导师公布](./docs/02-judges.md)
3. [Polkadot Hackathon 前 15 支队伍项目概览](https://mp.weixin.qq.com/s/NOmlm2EToCyibF8e7qzeyg)
4. [Polkadot Hackathon 全部参赛队伍项目概览 (下篇)](https://mp.weixin.qq.com/s/aHDuL6QZkBhNdBD4PnLdYg)

## 联络

对黑客松有任何疑问，可以下方法联系我们:

* [Github 讨论区](https://github.com/ParityAsia/hackathon-2021-spring/discussions)

* email: hackathon.asia@parity.io

## 其他

### 合法合规性

本次黑客松为符合国内法规，我们不会触碰以下任何有关题目

- 和发币 (Initial Coin Offering) 相关。
- 和数字资产交易相关
- 任何币价的讨论 (Decentralized Exchange 主题可讨论技术，不涉及币价)
- 和博彩相关和有博彩成分的游戏

### 参赛项目协议 (License)

所有参赛项目协议必须选用其中一个开源软件项目协议。下面有对主流协议的介绍 (包括 GPLv3, Apache License 2.0, BSD, MIT License)。如果真不知道怎么选，可考虑使用 MIT License。这协议给予其他开发者很大的自由度。

参考链接

- [主流开源协议介绍 - 英文](https://www.freecodecamp.org/news/how-open-source-licenses-work-and-how-to-add-them-to-your-projects-34310c3cf94/)
- [主流开源协议介绍 - 中文](https://www.runoob.com/w3cnote/open-source-license.html)
