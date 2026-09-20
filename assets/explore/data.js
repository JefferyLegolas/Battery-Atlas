window.ExplorationData = {
  "checkedAt": "2026-09-20",
  "experiments": [
    {
      "id": "silicon",
      "number": "01",
      "title": "把石墨换成硅",
      "question": "更能储锂的负极，为什么不直接全部换成硅？",
      "scope": "观察负极储锂与形变。这里只比较材料机制，不构造未经验证的全电池配方。",
      "variable": "负极活性材料",
      "options": [
        {
          "name": "石墨",
          "formula": "C → LiₓC₆",
          "mechanism": "锂进入层状宿主结构",
          "gain": "作为储锂宿主，石墨的层状结构参与嵌入与脱出。",
          "cost": "储锂容量受宿主结构限制。",
          "observe": "层间区域示意储锂，形变幅度较小。"
        },
        {
          "name": "硅",
          "formula": "Si → LiₓSi",
          "mechanism": "锂与硅发生合金化",
          "gain": "硅具有更高的材料比容量潜力。",
          "cost": "较大的体积变化带来结构与界面维护难题。",
          "observe": "颗粒轮廓明显增大，表示合金化伴随的体积变化。"
        }
      ],
      "conclusion": "储锂能力与结构稳定性需要一起考虑；材料比容量提高，不等于整颗电池能量按相同比例提高。",
      "boundary": "文献直接观察了石墨和硅–石墨复合电极；此处纯硅轮廓用于解释机制，不代表论文做过相同设计的纯硅全电池对照。形变不按测量比例绘制。",
      "evidence": "原位三维成像显示了电极微结构与电化学活动的联系，并讨论硅合金化带来的较大体积变化。",
      "locator": "原文硅–石墨复合电极（SiC electrodes）段落：原位微结构观察，以及材料容量和体积变化的讨论。",
      "source": {
        "title": "Quantifying microstructural dynamics and electrochemical activity of graphite and silicon-graphite lithium ion battery anodes",
        "journal": "Nature Communications · 2016",
        "doi": "10.1038/ncomms12909",
        "url": "https://www.nature.com/articles/ncomms12909",
        "fullText": "https://www.nature.com/articles/ncomms12909.pdf"
      },
      "family": "lfp",
      "related": "石墨负极的已收录实例：磷酸铁锂",
      "prompt": "材料比容量提高，能否直接推出整电池比能量提高相同倍数？",
      "answer": "不能。正极、容量配平、电解质与非活性部件也影响整电池质量和能量。"
    },
    {
      "id": "titanate",
      "number": "02",
      "title": "把石墨换成钛酸锂",
      "question": "为什么更高的负极电位，反而会降低电池电压？",
      "scope": "保持正极电位不变的教学比较，观察 U电池 ≈ U正极 − U负极；不对应某个实测电芯。",
      "variable": "负极材料与工作电位",
      "options": [
        {
          "name": "石墨",
          "formula": "石墨 / Li⁺–Li 参比",
          "mechanism": "较低的负极工作电位",
          "gain": "在相同正极电位下，可留下更大的两极电位差。",
          "cost": "工作电位接近锂沉积电位，需要关注充电条件。",
          "observe": "负极电位线较低，两极间距较大。"
        },
        {
          "name": "钛酸锂",
          "formula": "Li₄Ti₅O₁₂",
          "mechanism": "较高的负极工作电位",
          "gain": "工作电位远离锂沉积电位，具有高倍率应用价值。",
          "cost": "相同正极下电位差变小，能量密度还受容量等因素制约。",
          "observe": "负极电位线上移，两极电位差变小。"
        }
      ],
      "conclusion": "不能把“电位更高”直接理解为“电池电压更高”：关键在于两极的差值。",
      "boundary": "论文的研究主体是 LLTO，不是 LTO；这里仅使用其引言中对石墨与 LTO 的背景比较，不把 LLTO 的容量和循环数据移给 LTO。图中线高是定性示意。",
      "evidence": "引言说明石墨低工作电位的取舍，以及 LTO 较高的工作电位对全电池能量的约束。",
      "locator": "Introduction 第 1–2 段；不要将摘要的 LLTO 性能作为 LTO 指标。",
      "source": {
        "title": "Lithium lanthanum titanate perovskite as an anode for lithium ion batteries",
        "journal": "Nature Communications · 2020",
        "doi": "10.1038/s41467-020-17233-1",
        "url": "https://www.nature.com/articles/s41467-020-17233-1"
      },
      "family": "lto",
      "related": "查看已收录钛酸锂体系",
      "prompt": "正极电位不变，负极电位升高，电池电压怎样变化？",
      "answer": "降低。这里是电位差关系，不是实际充放电曲线或能量密度计算。"
    },
    {
      "id": "interface",
      "number": "03",
      "title": "硅负极里的碳，越多越好吗？",
      "question": "导电添加剂为什么可能促进电解质分解？",
      "scope": "对应 Tan 等的 Si–硫化物电解质复合负极界面对照：有／无 20 wt% 碳添加剂。",
      "variable": "复合负极中是否添加碳",
      "options": [
        {
          "name": "加入碳",
          "formula": "Si + SSE + 20 wt% C",
          "mechanism": "更多界面副反应",
          "gain": "碳通常用于提供电子导通路径。",
          "cost": "在该硫化物体系的对照中，碳促进电解质分解。",
          "observe": "较厚的橙色界面层表示更显著的分解；不是实际厚度。"
        },
        {
          "name": "不加碳",
          "formula": "Si + SSE，无碳添加",
          "mechanism": "减弱分解，但仍有界面形成",
          "gain": "论文对照中，去掉碳减少了硫化物电解质分解。",
          "cost": "仍需处理接触、首圈损失和压力条件，不能理解为没有副反应。",
          "observe": "界面层仍存在，但在定性示意中较薄。"
        }
      ],
      "conclusion": "添加剂的作用依赖所处体系；在液态电池中常用的设计，不能直接照搬到固态界面。",
      "boundary": "Fig. 2 的复合电极用于放大界面反应，与后文 99.9 wt% 微米硅长循环电极不是同一配方。本文循环采用约 50 MPa 堆叠压力；不据此预测量产性能。",
      "evidence": "含碳对照的衍射及光电子谱显示更明显的硫化物分解；无碳样品仍有钝化界面。",
      "locator": "Fig. 2 / Interface characterization；压力条件见正文 p.1497（PDF 第 4 页）。",
      "source": {
        "title": "Carbon-free high-loading silicon anodes enabled by sulfide solid electrolytes",
        "journal": "Science · 2021",
        "doi": "10.1126/science.abg7217",
        "url": "https://doi.org/10.1126/science.abg7217",
        "fullText": "https://lescmeng.ai/wp-content/uploads/science.abg7217.pdf"
      },
      "family": "solid",
      "related": "查看相关固态硅全电池（不同配方）",
      "prompt": "“无碳”是否意味着完全没有界面副反应？",
      "answer": "不是。论文仍观察到界面形成；减少持续分解与完全不发生反应是两回事。"
    }
  ]
};
