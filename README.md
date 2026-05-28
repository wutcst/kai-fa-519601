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

采用 Conventional Commits：

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
5. **分支保护**：master 设置 require PR + require review

---

