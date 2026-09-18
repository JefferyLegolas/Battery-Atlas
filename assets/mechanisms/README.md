# 电池机制模板规范

四个模板共享同一套视角、色板、线宽、标签和速度。27 个电池体系通过 JSON 中的 `mechanismType` 字段映射到模板，不为单个体系重复绘制动画。卡片使用静态 poster，详情页才按需加载动画。

| 模板 | 动画文件 | 卡片 poster | 适用范围 | 核心动效 |
| --- | --- | --- | --- | --- |
| 嵌入型 | `intercalation-template.svg` | `intercalation-poster.svg` | 摇椅式离子存储、质子嵌入类过程 | 工作离子在正负极宿主结构间嵌入/脱出 |
| 合金型 | `alloy-template.svg` | `alloy-poster.svg` | 合金化、溶解—沉积与部分转化反应 | 颗粒膨胀、收缩与裂纹 |
| 液流型 | `flow-template.svg` | `flow-poster.svg` | 全钒、全铁、锌溴液流 | 电解液循环与跨膜离子迁移 |
| 固态型 | `solid-state-template.svg` | `solid-state-poster.svg` | 硫化物、氟化物与陶瓷电解质 | 晶界传导、界面阻抗、压力与枝晶风险 |

## 统一规范

- **视角**：二维电芯剖面，正视；外部电路置于上方。
- **画布**：1200 × 760，主体结构区域约 1060 × 500。
- **色板**：正极 `#ff6b35`、负极 `#2156ff`、电解质/隔膜 `#137547`、离子 `#d7ff43`、结构线 `#10221c`、背景 `#f4f5f1`。
- **线宽**：结构线与轮廓 `2.5 px`；分隔线 `1.5 px`；电子流 `3 px`；均使用 `vector-effect="non-scaling-stroke"`。
- **标签**：中文主标签在前，英文缩写或公式在后；离子使用 `Li⁺`、`Na⁺` 或机制对应物种，电子使用 `e⁻`；所有图必须标注“示意图”。
- **速度**：完整循环 `5 s`；主要反应阶段约 `0–2.5 s` 和 `2.5–5 s`；电子虚线约 `1.2 s` 完成一次视觉移动。
- **动效边界**：只移动离子、电子、流动线或体积轮廓；不旋转、不闪烁、不使用弹跳。`prefers-reduced-motion` 下显示静态关键帧。
- **复用规则**：先复用画布、标签、箭头、图例和速度，再替换材料层、离子种类和反应路径。

## 站点映射

27 个体系都在 `data/systems/<id>.json` 中保存 `mechanismType` 和 `mechanismNote`。`mechanismType` 是数组，允许一个体系同时映射到多个模板，例如 `solid` 为 `["alloy","solid"]`。

可使用 `node scripts/assign-mechanism-types.mjs` 重新应用或审查映射；`scripts/validate-systems.mjs` 会检查每个体系是否具备合法且非空的映射。

## 加载策略

- 卡片读取 `*-poster.svg`，只显示静态关键帧，不播放动画。
- 详情页读取 `*-template.svg`，使用 `loading="lazy"`，只在打开详情并进入机制区域时加载。
- 机制图右下角提供“放大查看”按钮；放大窗口沿用同一个动画文件，并在手机端保持可横向滚动。
- 修改动画模板后运行 `node scripts/generate-mechanism-posters.mjs` 重新生成四张 poster。
