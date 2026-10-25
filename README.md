# 青禾云课

纯静态中文课程签到演示系统，使用浏览器 localStorage。全部学员为虚构测试身份，没有真实学员信息，也没有身份认证、管理员权限隔离或密码。

## 学员端与管理员端

- `index.html`：学员端，含课程选择、虚构学员切换、签到、个人统计、个人记录、课程筛选和 CSV 导出。
- `admin.html`：独立管理员演示页面，含各课程今日签到、累计人次、参与人数、所有测试学员记录、课程筛选及 CSV 导出。
- `checkin.html`：兼容旧入口，与学员端内容相同，可通过导航进入管理员端。
- 管理员端的“课程管理”“签到规则设置”仅为禁用的预留界面，没有实现编辑、签到时间或定位限制。

保留每天每位测试学员每门课签到一次的原有规则。尚未实现身份认证，任何访问者都可打开管理员演示页面。页面分离不是访问权限隔离。

## Windows 下载与 Cloudflare Pages 更新（无需命令行）

推荐在 GitHub 仓库首页选择 **Code → Download ZIP**，下载并解压，在解压出的项目中找到 **pages-upload** 文件夹。只上传该文件夹，不要上传整个仓库。

这个文件夹必须包含以下三个完整网页文件，且上传后它们处于网站根目录：

```text
pages-upload/
  index.html
  admin.html
  checkin.html
```

每个 HTML 已内嵌完整样式和脚本，不需要下载额外 CSS、JavaScript 或小程序文件，不用安装软件或配置构建命令。也可在 GitHub 分别打开这三个文件，点击 Download raw file 下载到 Windows 同一文件夹，保持文件名不变。不要另存为 .txt。

如需更新 Cloudflare，请由你在现有 Pages 项目中创建新部署，上传完整 pages-upload 文件夹。不要新建项目、改域名或更改部署设置，本次代码更新不会自动部署。不要继续使用之前仅包含一个 HTML 的旧上传包；新管理员页面需要 admin.html。

发布后的学员入口是原网站根路径 `/`，管理员入口是同一网站的 `/admin.html`（Cloudflare 也可能自动规范化为 `/admin`）。原 `/checkin.html` 入口保留。导航是相对链接，没有个人用户名或 GitHub 链接，不会改变现有域名。

## 同步与原数据保护

学员端和管理员端必须使用**同一浏览器配置文件、同一网站来源（协议、域名和端口）**，才能共享记录。新页面在签到、切换页面、返回页面及其他标签页产生存储事件时更新记录。

统一使用 `qhyun-class-demo-v1`。兼容读取旧课程版使用的 `culture-palace-demo-v1`，若两份数据均存在，会按学员、课程、日期、时间合并去重，保留独有记录，旧存储键不删除。旧键是内部兼容标识，不是具体单位信息。不同时间的历史记录不会因同日同课而被删除。读取异常不会用虚构种子覆盖原存储。

首次使用且没有任何原记录时，生成原有的 5 位虚构学员及 4 条示例记录；已有空记录列表也不会强行重置。更新同一域名通常保留 localStorage；清理浏览器数据、换浏览器或换域名不会自动迁移数据，建议更新前先导出 CSV（本版暂无导入）。不要在两个不同页面的 file:// 模式下依赖共享存储：不同浏览器可能隔离本地文件。要验证两端同步，优先在同一个网站域名下打开。

记录只在当前浏览器，不跨设备，不是多人共享后台。多个窗口同时写入没有数据库事务保证，建议逐次操作；写入前会重读最新记录，减少陈旧页面覆盖其他页面数据的风险。没有服务端、时间限制、定位或防代签；时间取自设备，请勿用于正式考勤。

## 本地体验（可选）

Windows 可将三个 HTML 保存在同一文件夹后双击 index.html 查看。file:// 方式在当前云端浏览器被管理策略禁止，未作验证；两端共享本地数据应通过同源网站验证。若 Windows 已有 Python，可在该文件夹命令提示符运行 `py -m http.server 8000 --bind 127.0.0.1`，保留窗口，用同一台 Windows 的浏览器打开 `http://127.0.0.1:8000/`。无需专门为此安装 Python。Codex 云端的 localhost 不是 Windows 的 localhost。

## 开发与测试

- `templates/student.html`、`templates/admin.html`：两个独立页面模板。
- `web.js`：页面交互；`storage.js`：共用存储及旧数据兼容。
- `course-model.js`：保留课程、签到、统计、CSV 规则。
- `styles.css`：两个页面共用的手机与电脑样式。
- `miniprogram/utils/checkin.js`：复用日期及原始签到工具。
- `scripts/build-standalone.cjs`：执行 `node scripts/build-standalone.cjs` 更新根目录及 pages-upload 中的三个独立 HTML。普通使用者无需运行。

规则和存储测试：`node --test tests/course.test.js tests/storage.test.js`。
浏览器测试：`node tests/browser.cjs`；使用 `CHECKIN_ENTRY=checkin.html node tests/browser.cjs` 检查兼容入口。使用 `SITE_DIR=pages-upload node tests/browser.cjs` 检查实际上传目录（Linux 命令示例）。浏览器测试需要开发环境已有 Playwright、Python 3 和 Chromium，这些不是网页运行依赖。

直接使用已有仓库，无需额外 Git worktree。
