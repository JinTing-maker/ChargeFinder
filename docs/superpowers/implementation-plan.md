# ChargeFinder 实现计划

基于 [设计规格书](specs/2026-06-23-chargefinder-design.md)，3 步完成。

## 步骤 1：项目骨架 ✅
- 创建 Django 项目 + products app
- 配置 settings.py（INSTALLED_APPS, MEDIA_URL/ROOT, 中文/上海时区）
- 配置 URL 路由（/ → 主页, /admin/ → 后台, dev 模式 media 服务）

## 步骤 2：数据模型
- Product：快充设备（含 category, brand, power, protocols JSON, image, 等）
- PowerRange：功率挡位（label, min, max）
- makemigrations + migrate

## 步骤 3：Admin 后台
- ProductAdmin：缩略图列表、list_filter、fieldsets
- PowerRange：默认注册

## 步骤 4：视图
- index 视图：查询 Product + PowerRange，聚合协议列表，json_script 传数据

## 步骤 5：模板
- Tailwind CSS CDN + Alpine.js CDN
- 筛选栏：类别切换 + 功率挡位 + 协议多选
- 产品卡片网格（响应式 CSS Grid）
- Alpine.js 前端求交集筛选

## 步骤 6：验证
- runserver → 后台录入数据 → 前台测试筛选
