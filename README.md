1. **地图系统**：100 个房间，10×10 网格布局，房间之间通过上下左右四个方向连通
2. **移动系统**：玩家通过 WASD 在房间间移动，每次移动消耗体力值
3. **传送房间**：约 10% 的房间为传送房间，进入后随机传送到地图任意位置
4. **回退功能**：支持回到上一个房间（R 键），使用 Redis 记录移动历史栈
5. **回城功能**：一键返回入口大厅（H 键）

6. **物品属性**：每个物品有名称、重量（占用空间）、价值三个属性
7. **房间物品**：每个普通房间随机放置 2~10 个物品
8. **背包系统**：玩家拥有容量上限的背包，支持拾取/丢弃/使用物品
9. **特殊物品**：
   - 魔法饼干：使用后背包容量 +10
   - 体力药水：使用后体力值 +10

10. **注册/登录**：用户名 + 密码，注册时支持上传头像
11. **玩家属性**：昵称、头像、分数、体力值、当前房间、背包
12. **体力值**：初始 200，移动/拾取/丢弃/使用物品均消耗体力，归零则 Game Over
13. **得分机制**：分数 = 背包中所有物品价值之和，实时计算

14. **存档系统**：支持保存/读取/删除多个存档，记录分数、体力、位置、背包状态
15. **新建游戏**：重置玩家状态（分数归零、体力满、回到入口、新建空背包）
16. **多人在线**：多个玩家同时在线，右侧排行榜实时展示所有玩家分数排名

17. **欢迎页**：登录/注册入口
18. **存档页**：存档列表 + 新建/读取/删除操作
19. **游戏主页**：房间场景 + 方向导航 + 物品交互 + 玩家信息面板 + 背包弹窗 + 排行榜
20. **视觉设计**：每个房间类型对应不同背景图，AI 生成精美素材



## 后端 Python TodoList

| #    | 任务                  | 产出文件                                                     | 依赖   |
| :--- | :-------------------- | :----------------------------------------------------------- | :----- |
| B1   | 项目脚手架            | pyproject.toml / requirements.txt / 目录结构 / .env          | 无     |
| B2   | 数据库模型            | models/ 下 player / room / item / backpack / save_record     | B1     |
| B3   | 数据库迁移 & 初始数据 | Alembic 迁移脚本 + init_data.py（灌地图/物品）               | B2     |
| B4   | 统一响应 & 异常处理   | schemas/result.py + 全局异常 handler                         | B1     |
| B5   | 玩家模块              | routers/player.py + services/player.py：login / register / info / list | B2-B4  |
| B6   | 房间模块              | routers/room.py + services/room.py：info（含出口+物品）      | B2-B4  |
| B7   | 移动 & 传送           | move / back / home / trans，Redis 存历史栈                   | B5, B6 |
| B8   | 背包模块              | routers/backpack.py + services/backpack.py：list / pick / throw / use | B2-B4  |
| B9   | 存档模块              | routers/game.py + services/game.py：new / save / read / list / delete | B2-B4  |
| B10  | 文件上传              | 七牛云上传封装 utils/qiniu_upload.py                         | B1     |
| B11  | 单元测试              | tests/ 下 4 个 service 测试文件                              | B5-B9  |
| B12  | CI/CD                 | GitHub Actions：ruff check + pytest + 打包部署               | B11    |

------

## 前端 TodoList

| #    | 任务                  | 产出                                                         | 依赖   |
| ---- | --------------------- | ------------------------------------------------------------ | ------ |
| F1   | 项目脚手架搭建        | Vite + Vue 3 + TS + Element Plus + ESLint + Prettier + Vitest | 无     |
| F2   | 路由 & 布局           | Vue Router (hash mode)：Welcome(login/archive) → Game        | F1     |
| F3   | API 封装层            | `src/api/index.js`：axios 实例 + playerApi / roomApi / backpackApi / gameApi | F1     |
| F4   | 登录/注册页           | `login.vue`：表单 + 头像上传 + localStorage 存 playerId      | F2, F3 |
| F5   | 存档页                | `Archive.vue`：存档列表 + 新建/读取/删除存档                 | F2, F3 |
| F6   | 游戏主页面 - 场景     | `Game.vue`：房间背景图切换、方向箭头导航、WASD 键盘监听      | F2, F3 |
| F7   | 游戏主页面 - 物品交互 | 房间物品渲染、点击拾取、使用物品（体力药水/魔法饼干）        | F6     |
| F8   | PlayerInfo 组件       | 左上角玩家信息面板：头像、昵称、分数、体力条                 | F6     |
| F9   | Backpack 组件         | 背包弹窗：物品列表 + 丢弃/使用按钮                           | F6     |
| F10  | LeaderBoard 组件      | 右侧排行榜：轮询 /player/list 展示分数排名                   | F6     |
| F11  | 回退/回城/传送 UI     | R/H 键绑定 + 传送房间自动触发                                | F6     |
| F12  | 前端测试 & 静态审查   | Vitest 单元测试 + ESLint v9 + Prettier                       | F4-F11 |

---

## 二、开发关键节点（里程碑）

### 后端期望关键节点

```
M1 (Day 1-2)  ─── 基础设施就绪
  └─ B1 + B2 + B3 + B4 完成
  └─ 数据库可连接，空接口能跑通

M2 (Day 3-5)  ─── 核心业务 API 完成
  └─ B5 + B6 + B7 + B8 + B9 + B10 完成
  └─ 所有接口可通过 Apifox/Postman 测通

M3 (Day 6-7)  ─── 质量保障
  └─ B11 + B12 完成
  └─ 单元测试全绿，CI pipeline 跑通
```

### 前端期望关键节点

```
M1 (Day 1-2)  ─── 基础设施就绪
  └─ F1 + F2 + F3 完成
  └─ 路由跳转正常，API 层 mock 可用

M2 (Day 3-4)  ─── 登录 & 存档流程
  └─ F4 + F5 完成
  └─ 能登录 → 选存档 → 进入游戏

M3 (Day 5-7)  ─── 游戏核心交互
  └─ F6 + F7 + F8 + F9 + F10 + F11 完成
  └─ 完整游戏循环可玩

M4 (Day 8)    ─── 质量保障
  └─ F12 完成
  └─ ESLint 0 error，测试覆盖关键路径
```

---

## 三、Git 分支策略 & 提交规划

### 分支结构

```
master          ← 只接受稳定版本合并，对应每个 Milestone 完成时
├── backend     ← 后端集成分支，后端成员 PR 目标
├── frontend    ← 前端集成分支，前端成员 PR 目标
├── dev/mzw     
├── dev/hcx     
├── dev/zpj     
└── dev/yzx     
```

### 提交信息规范

```
feat(scope): 新功能
fix(scope): 修复
docs: 文档
test: 测试
ci: CI/CD
chore: 杂项
refactor: 重构
```

1. **每个功能模块一个 PR**
2. **PR 之间间隔 1-2 天的时间戳** 
3. **Issue 配合 Milestone**：先建 3 个 Milestone（基础设施 / 核心功能 / 测试上线），每个 PR 关联对应 Issue
4. **Code Review 痕迹**：PR 里互相留 1-2 条 review comment 再 approve

---

