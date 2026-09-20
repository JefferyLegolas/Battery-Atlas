# 探索实验：证据与解释范围

核对日期：2026-09-20。三项均为定性教学交互，不是实验数据拟合或电池性能预测。动画由本站独立绘制，不复制论文图片；进度、形变和界面厚度均无实测数值含义。

| 实验 | 原始文献与定位 | 使用的结论 | 限制 |
| --- | --- | --- | --- |
| 石墨与硅 | Pietsch et al., Nature Communications 7, 12909 (2016), DOI 10.1038/ncomms12909；原位成像及硅–石墨电极部分 | 储锂结构演化与硅合金化的体积变化 | 实际研究对象包含硅–石墨复合电极，不能声称为纯硅整电池的同条件对照；不展示具体膨胀比例或整电池能量预测 |
| 石墨与 LTO | Zhang et al., Nature Communications 11, 3490 (2020), DOI 10.1038/s41467-020-17233-1；Introduction 前两段 | 较高的 LTO 负极电位限制全电池电位差 | 这篇论文主要研究 LLTO；本实验仅采用引言背景，不借用 LLTO 的容量、循环结果；固定正极线是教学假设 |
| 固态硅负极中有／无碳 | Tan et al., Science 373, 1494–1499 (2021), DOI 10.1126/science.abg7217；Fig. 2、Interface characterization、p.1497 | 含碳的 Si–SSE 对照发生更明显的硫化物分解 | Fig. 2 复合电极不同于后文高纯微米硅电极；无碳不等于无界面形成；堆叠压力及实验配方不能省略 |

原文入口：
- https://www.nature.com/articles/ncomms12909
- https://www.nature.com/articles/s41467-020-17233-1
- https://lescmeng.ai/wp-content/uploads/science.abg7217.pdf

## 实现边界

实验数据与解释独立放在 assets/explore/。原有图谱数据、SVG 动画、放大功能与筛选脚本保持原样。首页仅新增入口。实验状态通过 URL fragment 保存（实验、条件、示意进度），不保存用户身份或发送数据。

播放由用户主动启动，到结尾停止；手动拖动、切换实验、切换条件或隐藏页面会暂停。键盘可以操作按钮与范围滑块。分享不可用时提示复制地址栏。

## 验证

运行 node scripts/test-explorations.mjs 和 node scripts/validate-systems.mjs。浏览器检查三个实验的两种状态、播放、滑块、链接重载与移动端布局。恢复旧动画的回退版本为 033ea83a7d63c28a1597f61da47a01cce3c52d78。
