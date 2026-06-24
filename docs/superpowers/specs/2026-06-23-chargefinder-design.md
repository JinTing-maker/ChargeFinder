# ChargeFinder 设计规格书

**日期：** 2026-06-23  
**项目：** ChargeFinder —— 快充设备精选导航仪  
**技术栈：** Django + SQLite + Tailwind CSS (CDN) + Alpine.js  

---

## 1. 项目概述

ChargeFinder 是一个由主理人驱动的快充设备精选库。主理人通过 Django Admin 后台录入产品数据，访问者在单一页面上通过多维筛选器即时浏览产品。

**核心理念：** 零用户系统、零 API 层、零前端构建。一切保持轻量。

---

## 2. 项目结构

```
chargefinder/
├── manage.py
├── chargefinder/
│   ├── __init__.py
│   ├── settings.py          # MEDIA_URL/ROOT 配置
│   ├── urls.py              # / → 产品主页, /admin/ → 后台
│   └── wsgi.py
├── products/                # 唯一 App
│   ├── __init__.py
│   ├── models.py            # Product + PowerRange
│   ├── admin.py             # 自定义 ModelAdmin
│   ├── views.py             # 单视图：产品列表
│   ├── urls.py
│   └── templates/
│       └── products/
│           └── index.html   # 唯一前端页面
├── media/
│   └── products/            # 上传的产品图片
└── static/                  # 可选：自定义 CSS
```

- Python 环境：conda 环境 `vibe_code`
- 数据库：SQLite（Django 默认）
- URL 路由：`/` → 产品主页，`/admin/` → 管理后台
- 无用户系统，无前端构建工具

---

## 3. 数据模型

### 3.1 Product（产品）

| 字段 | 类型 | 说明 |
|---|---|---|
| category | CharField(choices) | 充电器 / 充电宝 |
| brand | CharField(50) | 品牌名 |
| name | CharField(100) | 型号名称 |
| max_power | IntegerField | 最高总功率(W) |
| max_single_power | IntegerField | 单口最高功率(W) |
| protocols | ManyToManyField(Protocol) | 支持协议（多选预设列表） |
| ports_desc | CharField(20) | 接口描述，如 "2C1A" |
| port_count | IntegerField | 接口总数量 |
| has_usb_a | BooleanField(default=False) | 是否带 USB-A 口 |
| price | DecimalField(8,2) | 参考价格 |
| image | ImageField | 上传至 `products/` 目录 |
| weight | IntegerField(null) | 重量(g)，可选 |
| volume | IntegerField(null) | 体积(cm³)，可选 |
| variants | JSONField(null) | 颜色变体，可选 |
| created_at | DateTimeField(auto_now_add) | 创建时间 |

- 默认排序：按 `created_at` 倒序
- 协议改为 ManyToMany，Admin 内置双栏选择器，无需手打 JSON
- 前端筛选协议列表从 Protocol 模型直接读取

### 3.2 Protocol（快充协议预设）

| 字段 | 类型 | 说明 |
|---|---|---|
| name | CharField(30, unique=True) | 协议名称，如 "PD3.1" |

- Admin 后台可增删协议名
- Product 的 protocols 从此表选择，统一命名

### 3.3 PowerRange（功率挡位配置）

| 字段 | 类型 | 说明 |
|---|---|---|
| label | CharField(20) | 显示名，如 "30W以下" |
| min_value | IntegerField(default=0) | 下限 |
| max_value | IntegerField | 上限（0 = 无上限） |

- 前端筛选器的功率阶梯从该模型动态读取
- Admin 后台可增删改，灵活调整挡位

---

## 4. Admin 后台

### ProductAdmin 定制

- **列表显示：** 缩略图预览、品牌、型号、类别、功率、价格
- **右侧筛选：** 按 `category`、`brand`
- **搜索：** 品牌、型号名
- **表单分组（fieldsets）：**
  - 基本信息：category, brand, name, image
  - 功率与接口：max_power, max_single_power, protocols, ports_desc, port_count, has_usb_a
  - 其他属性：price, weight, volume, variants
- 缩略图通过 `format_html` 返回 HTML `<img>` 标签实现

### ProtocolAdmin

- 默认注册，列表可增删协议名

### PowerRange

- 默认注册即可，增删几条挡位数据

---

## 5. 前端页面

### 5.1 页面布局（单页）

```
┌──────────────────────────────────────────────┐
│  ⚡ ChargeFinder    快充设备精选导航          │
├──────────────────────────────────────────────┤
│  类别: [全部] [充电器] [充电宝]               │  ← 水平按钮切换
│  功率: [全部] [30W以下] [30-65W] ...          │  ← 从 PowerRange 动态生成
│  协议: ☑ PD3.1 ☑ PPS ☑ UFCS ☑ QC5 ...      │  ← 多选 checkbox
├──────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ 产品图  │  │ 产品图  │  │ 产品图  │         │  ← CSS Grid
│  │ 品牌 型号│  │         │  │         │         │    sm:2列
│  │ 140W   │  │  65W   │  │  30W   │         │    lg:3列
│  │ PD3.1  │  │ QC5    │  │ UFCS  │         │    xl:4列
│  │ 220g   │  │        │  │ 黑色/白│         │
│  └────────┘  └────────┘  └────────┘         │
│          "找到 12 款"                         │
└──────────────────────────────────────────────┘
```

### 5.2 卡片信息层级

1. 产品图片（全宽）
2. 品牌 + 型号（粗体）
3. 总功率（大号彩色数字，`text-3xl font-bold`，核心视觉锚点）
4. 协议标签（彩色小圆角标签，不同协议不同色系）
5. 辅助行：接口描述、价格、重量/体积、颜色变体（灰色小字）

### 5.3 筛选逻辑（Alpine.js）

- 数据通过 `json_script` 模板标签嵌入页面
- 筛选规则：`category AND power AND protocols` 求交集
- 功率挡位从 PowerRange 模型读取
- 协议复选框从所有产品聚合去重生成
- 筛选后显示结果计数，无结果时显示空状态提示
- 零网络请求，纯前端过滤

### 5.4 技术细节

| 方面 | 方案 |
|---|---|
| Tailwind CSS | CDN 引入 |
| 数据传递 | `json_script` 将 QuerySet 序列化为 JSON |
| 响应式 | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| 空状态 | "没有找到匹配的设备" 提示文案 |
| 协议色系 | PD 系蓝色、PPS 绿色、UFCS 橙色、QC 紫色等 |

---

## 6. 错误处理

- DEBUG 模式开启时，Django 自带错误页面
- 生产环境：自定义 404/500 模板
- Admin 后台图片上传失败：Django ImageField 自带验证
- 筛选无结果：前端友好提示

---

## 7. 开发步骤概述

1. **项目初始化** —— 创建 Django 项目 + products app，配置 MEDIA_URL/ROOT
2. **数据库与后台** —— 编写 models，运行 migration，注册 Admin
3. **前端页面** —— 编写视图、模板（Tailwind + Alpine.js 筛选）

---

## 8. 不包含的内容（明确排除）

- 用户系统（注册/登录/权限）
- REST API 层
- 前端构建工具（webpack/vite）
- 搜索功能（Admin 后台搜索除外）
- 产品详情页（当前仅需列表页）
- 分页（精选库产品量有限，单页展示即可）
- 评论/评分/收藏等社交功能
