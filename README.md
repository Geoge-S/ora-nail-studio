# ORA — Outstanding Refined Art

一个可以直接打开的美甲师个人作品集网站。奶油纸感、墨黑细线、法式排版，包含首页、作品、价目、关于、日志与预约六个部分。

> **这是一个演示网站。** 品牌 ORA、主理人故事、地址、电话、微信、Instagram、价格、顾客评价与文章均为虚构；预约表单不会发送或保存任何数据。正式使用前请替换为你的真实信息与作品图。

---

## 立即打开

双击 **`index.html`** 即可。推荐使用 Chrome、Edge 或 Safari。

也可以在 Windows 上双击 **`打开网站.cmd`**，它会用默认浏览器打开首页。

不需要安装任何依赖，不需要启动服务器。字体、图片、样式和脚本都在本地，断网也能正常显示。

### 上线

整个文件夹就是纯静态站点，没有构建步骤。可以把整个目录上传到 GitHub Pages、Netlify、Vercel、Cloudflare Pages，或任何支持静态文件的空间，入口保持 `index.html` 即可。

---

## 页面

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页：主视觉、工作室介绍、近期作品、价目预览、顾客评价、日志、预约引导 |
| `works.html` | 作品集：分类筛选、瀑布流画廊、点击查看大图（支持 ← / → / Esc） |
| `services.html` | 价目：基础与颜色、结构定制、加项、预约须知、到店流程、常见问题 |
| `about.html` | 关于：主理人故事、三件小事、工作室信息 |
| `journal.html` | 日志：特色文章与文章列表 |
| `journal-french.html` | 文章：法式不只一种 |
| `journal-aftercare.html` | 文章：让美甲多美七天 |
| `journal-color.html` | 文章：裸色不是一种颜色 |
| `journal-process.html` | 文章：两小时，到底在做什么 |
| `booking.html` | 预约：前端演示表单、校验、成功摘要 |

---

## 已实现的功能

- **完整响应式**：桌面、平板、手机三档布局，手机端全屏菜单。
- **作品筛选与灯箱**：按裸色、珍珠、细节、编辑、新娘筛选；灯箱支持键盘方向键与 Esc，打开时锁定页面滚动。
- **预约表单**：
  - 姓名、手机号 / 微信号、服务、日期、时段、备注、首次到店、协议勾选；
  - 校验必填项、手机号或微信号格式、过去日期、90 天范围、周一闭店、当天已过时段；
  - 提交后生成演示预约编号与信息摘要，可一键重置再约。
- **微信一键复制**：预约页点击 `ORA_nail` 旁的「复制」即可写入剪贴板（带降级方案）。
- **细节交互**：滚动渐显、图片缓慢放大、吸顶导航与筛选条、跑马灯；全部尊重 `prefers-reduced-motion`。
- **本地化资源**：Cormorant Garamond 与 Jost 字体、全部图片均存放在 `assets/`，不依赖外部 CDN。
- **无障碍基础**：跳转链接、语义化标题、表单 label 与错误提示、键盘焦点样式、`aria-current`、`aria-expanded`、灯箱 `dialog` 焦点管理。

---

## 如何替换成你的内容

### 1. 品牌名与文案

直接用编辑器打开根目录的 HTML 文件，搜索并替换：

- `ORA` / `Outstanding Refined Art`
- `ORA_nail`（微信号）
- `0351 0000 0000`（电话）
- `山西省太原市和平北路`（地址）
- `@ora.nail.studio`（Instagram）
- 各页面 `<title>` 与 `<meta name="description">`

### 2. 图片

所有图片在 `assets/images/`，共 20 张，文件名对应用途：

- `hero-signature.jpg`：首页主视觉
- `hands-nude.jpg`：关于页肖像 / 首页作品
- `work-*.jpg`：作品与画廊（15 张作品图）
- `studio-*.jpg`：工作室氛围
- `process.jpg`：流程 / 文章
- `journal-color.jpg`：文章配图

新增的 7 张作品图来自 Pixabay 免费图库，具体来源见 [`CREDITS.md`](CREDITS.md)。小红书上的美甲图多为博主原创，直接下载使用会有版权与肖像权风险，所以没有直接搬运；如果你有自己的作品图或授权图，替换对应的 `work-*.jpg` 即可。

替换时保持文件名不变即可，建议宽度 1000–1400px、JPEG 质量 80–86。若换成长宽比差异很大的图，CSS 会居中裁切。

### 3. 价格与服务

价目页 `services.html` 与首页 `index.html` 的价目预览是两处独立内容，需要分别修改。搜索 `¥` 或「单色甲油」即可定位。

### 4. 预约功能接后端

当前表单只在浏览器内生成确认卡，不会发送数据。要变成真实预约，可选：

- 接 Formspree、Getform 等表单服务：给 `<form>` 加 `action`，去掉 JS 的 `preventDefault` 或改为提交后显示成功；
- 接自己的 API / 小程序：把 `assets/js/main.js` 中 `form.addEventListener('submit', ...)` 的演示逻辑替换为 `fetch`；
- 或者保持现状，把成功文案改成「请加微信 ORA_nail 确认」。

### 5. 颜色与字体

设计变量集中在 `assets/css/style.css` 顶部 `:root`：

```css
--paper: #f3eee5;   /* 纸底 */
--cream: #faf7f1;   /* 浅色区块 */
--ink: #191712;     /* 墨色 */
--accent: #8d5a43;  /* 陶土色点缀 */
--serif: 'Cormorant Garamond', 'Songti SC', 'STSong', 'SimSun', serif;
--sans: 'Jost', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

中文字体使用系统宋体 / 苹方 / 微软雅黑回退；拉丁字体已自托管，断网也能显示。

---

## 兼容性

- Chrome / Edge / Safari / Firefox 现代版本。
- 使用 `dialog`、`IntersectionObserver`、`input[type=date]`、CSS `aspect-ratio` 与 `svh`。
- 在 `file://` 下已实测：字体、图片、脚本、表单与灯箱均正常，无控制台报错、无横向溢出。
- 若浏览器限制本地字体加载，会自动回退到系统宋体 / 黑体，布局不受影响。

---

## 预览图

`preview/` 里是几张已经压缩好的页面截图，方便快速浏览：

- [首页首屏](preview/home-hero.jpg)
- [作品页](preview/works.jpg)
- [价目页](preview/services.jpg)
- [日志页](preview/journal.jpg)
- [手机端首页](preview/home-mobile.jpg)
- [预约页](preview/booking.jpg)

---

## 字体与图片来源

- **Cormorant Garamond**、**Jost**：SIL Open Font License 1.1，通过 Google Fonts 获取并自托管。
- **摄影图片**：Burst（Shopify 免费图库）与 Pexels，均为可免费使用的占位素材，具体来源见 [`CREDITS.md`](CREDITS.md)。

正式上线前，请把这些占位图替换为你自己的作品，并确认模特肖像与图片授权。

---

## 验收

项目不依赖任何构建工具。交付前已用无头 Chrome 在 1440px 桌面与 390px 手机下逐页截图检查：字体与图片全部加载、无横向溢出、无控制台报错；作品筛选、灯箱、预约表单校验与成功状态、移动菜单均已实际操作验证。

---

*Made as a quiet study of hands.*
