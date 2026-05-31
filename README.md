# Programman

Programman 是一个纯静态的个人博客和 vibe-coding 产品展示站点。

## 功能

- 公开博客列表、博客详情和产品展示页。
- `/admin` 管理页面，可新增、编辑、删除博客和产品。
- 管理页通过 GitHub Contents API 直接更新仓库里的 JSON 内容文件。
- GitHub Pages 自动部署，不需要服务器。
- 自定义域名：`programman.dpdns.org`。

## 本地开发

```bash
npm install
npm run dev
```

## 发布流程

1. 创建 GitHub 仓库并推送本项目。
2. 在 GitHub 仓库 Settings -> Pages 中选择 GitHub Actions。
3. 将 `programman.dpdns.org` 添加为自定义域名并启用 HTTPS。
4. 在 `dash.domain.digitalplat.org` 为 `programman.dpdns.org` 添加 CNAME，指向你的 GitHub Pages 默认域名：`你的用户名.github.io`。
5. 访问 `/admin`，填入仓库 owner、repo、branch 和 GitHub token 后发布内容。

## GitHub token 权限

建议使用 fine-grained personal access token，仅授权目标仓库，并开启：

- Contents: Read and write
- Metadata: Read-only

token 只保存在当前浏览器，不会写入仓库。
