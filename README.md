# 去泰国 · Thailand, here we go

根据用户提供的「泰国旅行-资料」整理的旅行攻略，暂时使用 https://programman.dpdns.org/。

包含 4–8 日行程时间线、交通提醒、美食收藏、商品抠图与原图、可保存的购物和行李清单。支持手机、明暗主题和打印。原始资料未注明月份、年份、航班或酒店，页面不将建议时间表述为预订信息。

## 开发与发布

```sh
npm ci
npm run dev
npm run build
npm run preview
```

推送到 main 后，由现有 GitHub Actions 工作流构建并发布到 GitHub Pages。自定义域名在 public/CNAME 中。

资料核对和图片说明见 [research/README.md](research/README.md)。清单仅保存在当前浏览器。

## 恢复原站

原站提交为 4ef982512bb7eae5148282aab2a95399c0b4aefe，本地备份分支为 archive/programman-before-thailand-20260928。恢复时可回退此次页面变更并重新部署。
