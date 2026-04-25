## 1. 架构设计
```mermaid
graph TD
    A["前端应用 (React)"] --> B["页面级组件 (LoginPage)"]
    B --> C["左侧插图组件 (Illustration)"]
    B --> D["右侧登录卡片组件 (LoginCard)"]
    D --> E["标签切换控制 (Tabs)"]
    D --> F["账号登录表单 (AccountForm)"]
    D --> G["扫码登录展示 (QRCodeDisplay)"]
    F --> H["密码登录视图"]
    F --> I["验证码登录视图"]
```

## 2. 技术栈说明
- 前端框架: React@18 + Vite
- 样式方案: TailwindCSS@3
- 图标库: Lucide React (用于输入框图标)
- 动画库: Framer Motion (用于页面加载、标签下划线滑动、表单切换动画)

## 3. 路由定义
| 路由 | 用途 |
|-------|---------|
| / | 默认入口，展示登录页面 |

## 4. 组件状态设计
**LoginCard 组件状态:**
- `activeTab`: 'account' | 'qrcode' (当前选中的顶级标签)
- `accountMode`: 'password' | 'code' (账号登录下的子模式)
- `formValues`: 存储账号、密码、手机号、验证码等输入值

## 5. 项目结构规划
```text
src/
├── assets/
│   └── (存放背景图、Logo、占位图等静态资源)
├── components/
│   ├── LoginCard.jsx
│   ├── AccountForm.jsx
│   ├── QRCodeDisplay.jsx
│   └── IllustrationPlaceholder.jsx
├── App.jsx
├── main.jsx
└── index.css (包含 Tailwind 引入和自定义动画变量)
```
