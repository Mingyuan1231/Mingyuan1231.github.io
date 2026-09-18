# 个人学术网站：项目定位与实施依据

记录日期：2026-09-18。当前阶段：首版已上线，依据本人提供的 CV 与 Research Statement 扩充内容。

## 已确认目标

- 使用 GitHub Pages，网站地址采用 GitHub 提供的 github.io 域名。
- 核心是展示本人的学术成就、当前身份和研究状态。
- 面向研究同行、潜在合作者，以及检索论文和相关领域问题的读者。
- 提高相关内容在搜索及联网生成式回答中被发现、正确归属和引用的机会。
- 本人提供的姓名：Mingyuan Wang；单位：UMass；学术身份原文：phd in physics。
- 网站以英文为主，面向国际学术检索。

本人已确认 UMass Amherst / Krastanov 实验室成员资料对应本人，身份为物理学博士生，研究方向为纠缠蒸馏与量子纠错。GitHub 账号为 Mingyuan1231。

本人希望使用 mingyuanwang.github.io，但 mingyuanwang 用户名已被占用。本人随后明确选择暂时保留 mingyuan1231.github.io。不要自动修改 GitHub 用户名或配置到他人的域名。

## 成功的定义

读者能快速判断“你是谁、研究什么、做出了哪些贡献、目前在做什么”，并找到可以核验的原始论文、代码和资料。

搜索系统能够抓取完整正文，识别作者及论文关系，为具体研究问题找到有证据支持的回答段落和稳定页面地址。

区分三种结果：网页收录、AI 回答中的来源引用、学术文献引用。前两者的改善不代表论文引用次数增加。也不能保证任何生成式系统的排名、引用或不联网回答中的知识更新。

## 建议内容架构

以下为初版设计建议，待本人资料确定后落地，不代表已有这些成果。

| 页面 | 主要内容 | 作用 |
| --- | --- | --- |
| `/` | 公开姓名、当前职位和单位、研究简介、代表作、带日期的近况 | 建立学术身份，展示成就和当前状态 |
| `/publications/` | 完整论文目录、年份、发表状态、各论文页面入口 | 便于读者和爬虫找到成果 |
| `/publications/<slug>/` | 每篇论文的准确书目信息、完整原始摘要、贡献解读、局限、资料链接和引用格式 | 形成稳定、可核验、可引用的论文入口 |
| `/research/<topic>/` | 具体研究问题、已有方法、本人工作的贡献与适用条件、参考文献 | 覆盖领域问题检索，提供有价值的解释 |
| `/cv/` | 教育与工作经历、已核实的荣誉和学术服务、联系方式 | 提供结构清楚的学术履历 |

首页突出少量代表作；完整列表保留在论文目录中。避免所有论文只存在于一张长列表或一个 PDF 中。

## 内容原则

1. 身份信息以本人确认或可靠公开来源为准；姓名、单位、ORCID 等保持一致。
2. 论文保留准确标题、全部作者与顺序、年份、期刊或会议、DOI 和版本状态；区分预印本、已接收与已发表。
3. 原始摘要与新增解读明确区分。贡献说明写清研究问题、方法、结果及适用边界，不夸大个人贡献。
4. 数字、比较、奖项和“首次”等主张必须有证据；不编写未经核实的成果或引用量。
5. 研究主题页先给出简明回答，再解释条件与证据；引用相关原始研究，包括必要的他人工作。
6. 页面标题和小标题采用真实学术术语及读者会问的问题，避免关键词堆砌、批量低质量问答和隐藏文本。
7. 新闻、职位、项目状态注明真实日期；页面修改时间只随实质内容更新。
8. 仅发布允许公开的论文版本和资料；无本地全文时提供 DOI、预印本或机构存储库入口。

## 技术方向与 GEO 实施

- 使用静态生成、多页面 HTML，适配 GitHub Pages；核心内容及导航不依赖浏览器执行 JavaScript。
- 每个正式页面有独立 URL、准确标题、描述和 canonical；提供 sitemap.xml、robots.txt、语义化标题与普通 HTML 内链。
- 首页与论文页面可分别采用 Person/ProfilePage、ScholarlyArticle 结构化数据，字段必须与可见内容一致。这是辅助表达，不是排名或 AI 引用保证。
- 学术论文详情页配置准确的 citation_title、逐个 citation_author、citation_publication_date 及适用的期刊或会议信息；不要把普通科普文章标成论文。
- 若配置 citation_pdf_url，遵循 Scholar 对全文位置的要求，保证实际可访问且与论文版本对应。
- 允许目标搜索爬虫访问公开内容，避免误加 noindex 或限制摘要展示的指令。确认 OAI-SearchBot 的搜索访问；训练抓取策略另行决定，不把同意训练作为搜索收录前提。
- 不把 llms.txt 或所谓专用 GEO 标签视为必需条件或效果保证。
- 优先使用账号主页地址 https://<username>.github.io/；实际仓库名和所有绝对 URL 等待 GitHub 用户名确认。
- 若使用项目子路径，另行核查资源和 canonical 的 base path；robots.txt 的规则由域名根目录文件控制。
- 保持移动端可读、键盘可操作、页面轻量；具体框架在实施阶段选择，不为宣传站增加无必要的运行时后端。
- 网站以英文为主；只有实际增加中文内容时才建立对应语言页面及语言关联。

## 可信度与发布后的工作

本人可维护的 ORCID、机构主页、Google Scholar 等公开资料应准确关联网站，以帮助读者核验身份；不推断单个外链必然提高排名。

发布后验证实际域名、页面状态、站点地图和爬虫访问；在可访问对应账号时配置 Google Search Console，并考虑 Bing Webmaster Tools。尚未取得账号信息的工作不视为已完成。

用少量与实际研究相关的固定查询观察结果：姓名与单位、论文题目、研究问题、方法比较。记录查询日期、平台、是否联网、引用页面及归属是否准确；结果会随时间和系统变化。

关注收录情况、相关查询展示与点击、可观测的 AI 引荐访问，以及抽样回答中的引用准确性。没有来源信息的访问不擅自归因；AI 引用也未必产生点击。

## 首版验收

- 公开身份、成果、研究状态均有本人确认或来源依据；无虚构数据、未替换占位符或无效入口。
- 首页、论文目录、实际论文详情和所需主题页面可通过普通链接访问。
- 禁用 JavaScript 后仍能读到重要正文和完整原始摘要。
- 引用元数据、结构化数据与可见内容一致；生产域名、canonical、站点地图一致。
- 桌面和移动布局可用；论文、DOI、代码、引用下载等实际存在的链接可用。
- GitHub Pages 部署后验证公开页面，而不是只依据本地构建判断上线成功。

## 待补充资料

- 本人已提供 Google Scholar（j_yVltwAAAAJ）和 ORCID（0000-0002-1010-2807），网站采用其公开个人 URL。
- 论文列表现包含 CV 所列的四篇公开论文及一篇准备中的手稿；公开论文摘要与当前 Sequence 手稿摘要已按本人要求补齐。
- 头像、CV 和可公开论文文件可后续补充；英文为主的语言偏好已确认。

## 已核实的公开资料

- [Krastanov 实验室成员页](https://lab.krastanov.org/team/)：列有 Mingyuan Wang（王明元），Physics PhD Student。
- [UMass Amherst 2025 QuantumSavory workshop](https://www.umass.edu/quantum/2025-quantumsavory-workshop/)：简介提及与 Stefan Krastanov 合作，研究 entanglement distillation 与 quantum error correction。
- [UMass Amherst 物理系研究生目录](https://www.umass.edu/physics/people/graduate-students)：列有同名研究生。

本人已确认身份；仍不将其他同名作者的成果自动并入本人履历。论文以 arXiv 原始记录核实，预印本不标作已发表的期刊文章。

## CV 与研究陈述补充

- 本人提供的 CV 将当前身份明确为 Physics PhD Candidate，网站身份信息同步更新。
- 依据本人材料补充研究经历、PairMoment 序列控制、图态合成、计算和实验技能、教学及 CQN 服务。
- 两篇早期已发表文章的作者、DOI、日期及期刊元数据核对 Crossref 和 arXiv 记录。
- 未来研究方向与正在开展的项目分别标注，不将计划写作已完成成果。
- 本人确认 UMass workshop 日期采用官网的 2025 年 6 月 2 日。
- 原始申请材料及提取中间文件保留在网站发布范围之外。

## 官方依据

- [GitHub Pages：静态托管、账号站与项目站](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Google：AI 搜索功能与网站要求](https://developers.google.com/search/docs/appearance/ai-features) — SEO 基础继续适用，无额外特殊标记要求，收录与展示均不保证。
- [Google Scholar：收录与论文元数据要求](https://scholar.google.com/intl/en/scholar/inclusion.html) — 独立论文 URL、可访问原始摘要、引用元数据及全文要求。
- [OpenAI：爬虫说明](https://developers.openai.com/api/docs/bots) — OAI-SearchBot 与 GPTBot 的用途及独立控制。
