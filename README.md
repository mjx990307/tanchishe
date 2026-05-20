# 贪吃蛇游戏 (Tanchishe)

一个经典的贪吃蛇小游戏项目，使用现代 Web 技术实现。

## 项目简介

这是一个经典的贪吃蛇游戏项目，旨在提供流畅的游戏体验和美观的用户界面。玩家通过控制蛇的移动来吃食物，每吃到一个食物蛇身会变长，同时分数增加。游戏包含碰撞检测、分数统计、暂停/继续等功能。

## 功能特性

- 🎮 经典贪吃蛇游戏体验
- ⬆️⬇️⬅️➡️ 键盘方向键控制
- 📊 实时分数统计
- ⏸️ 游戏暂停和继续功能
- 🔄 游戏重新开始
- 🎨 现代化的 UI 界面
- 📱 响应式设计，支持多种设备

## 技术栈

- HTML5 Canvas 用于游戏渲染
- JavaScript 用于游戏逻辑
- CSS3 用于样式设计

## 安装和运行

### 1. 克隆项目

```bash
git clone <repository-url>
cd tanchishe
```

### 2. 运行游戏

直接在浏览器中打开 `index.html` 文件即可运行游戏，或者使用本地服务器：

```bash
# 使用 Python
python3 -m http.server 8000

# 使用 Node.js (http-server)
npx http-server
```

然后在浏览器中访问 `http://localhost:8000`

## 游戏说明

### 操作方式

- **↑** / **W** - 向上移动
- **↓** / **S** - 向下移动
- **←** / **A** - 向左移动
- **→** / **D** - 向右移动
- **空格键** - 暂停/继续游戏
- **R** 键 - 重新开始游戏

### 游戏规则

1. 控制蛇吃红色的食物来增长身体和获得分数
2. 每吃一个食物，分数 +10，蛇身变长
3. 游戏结束条件：
   - 蛇头撞到墙壁
   - 蛇头撞到自己的身体
4. 挑战最高分记录！

## 项目结构

```
tanchishe/
├── index.html          # 主 HTML 文件
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── game.js         # 游戏逻辑文件
├── assets/             # 资源文件夹
│   └── images/         # 图片资源
└── README.md           # 项目文档
```

## 开发计划

- [x] 实现基础的贪吃蛇移动、进食和碰撞逻辑
- [x] 增加分数统计
- [x] 支持游戏暂停和重新开始
- [x] 优化界面和交互体验
- [ ] 添加不同难度级别
- [ ] 增加最高分记录功能
- [ ] 添加音效和背景音乐
- [ ] 支持触摸操作（移动端优化）
- [ ] 添加游戏设置选项

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

享受游戏！🐍

