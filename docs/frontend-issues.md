# 前端 Issue 细化任务清单（完整版）

## Milestone：前端功能基本完善

---

## Issue 1: `[Core] 搭建前端基础设施：项目脚手架、路由布局、API 封装层`

覆盖 `F1 + F2 + F3`，对应里程碑 `M1`

- [ ] `F1-1` 使用 Vite 创建 Vue 3 + TypeScript 项目
- [ ] `F1-2` 安装 Element Plus 并全局注册（`main.ts`）
- [ ] `F1-3` 配置 ESLint（`eslint.config.js`，flat config 格式，含 TypeScript + Vue 插件）
- [ ] `F1-4` 配置 Prettier（`.prettierrc`，`semi: false`, `singleQuote: true`）
- [ ] `F1-5` 配置 Vitest（`vitest.config.ts`，jsdom 环境）
- [ ] `F1-6` 配置路径别名 `@/` -> `src/`（`vite.config.ts` + `tsconfig.json`）
- [ ] `F1-7` 配置开发代理 `/api` -> `http://localhost:8080`
- [ ] `F2-1` 创建 `Welcome.vue` 作为欢迎页容器（含子路由出口 `<router-view />`）
- [ ] `F2-2` 创建路由配置（hash mode）：`/welcome/login` -> `/welcome/archive` -> `/game`
- [ ] `F2-3` 创建 `App.vue` 根组件（仅含 `<router-view />` + 全局样式重置）
- [ ] `F2-4` 路由守护
- [ ] `F3-1` 创建 axios 实例（`baseURL: '/api'`，`withCredentials: true`）
- [ ] `F3-2` 实现请求拦截器（自动从 localStorage 读取 token 注入 `Authorization` header）
- [ ] `F3-3` 封装 `playerApi`（`login / register / getInfo / move / getList / trans / back / home`）
- [ ] `F3-4` 封装 `roomApi`（`getInfo`）
- [ ] `F3-5` 封装 `backpackApi`（`getList / pickItem / dropItem / useItem`）
- [ ] `F3-6` 封装 `gameApi`（`getList / save / read / delete / new`）

---

## Issue 2: `[Core] 实现登录注册与存档管理页面`

覆盖 `F4 + F5`，对应里程碑 `M2`

- [ ] `F4-1` 创建 `Login.vue` 页面，包含用户名输入框 + 密码输入框
- [ ] `F4-2` 实现登录功能：调用 `playerApi.login`，成功后存 `playerId` 到 localStorage，跳转 `/welcome/archive`
- [ ] `F4-3` 实现注册功能：调用 `playerApi.register`（FormData 传参），成功后提示“注册成功，请登录”
- [ ] `F4-4` 登录/注册失败时使用 `ElMessage.error` 显示后端返回的错误信息
- [ ] `F4-5` 登录页视觉设计：深色渐变背景 + 毛玻璃卡片效果
- [ ] `F5-1` 创建 `Archive.vue` 页面，使用 `el-table` 展示存档列表（存档 ID / 保存时间 / 分数 / 体力）
- [ ] `F5-2` 实现“新建游戏”按钮：调用 `gameApi.new`，成功后跳转 `/game`
- [ ] `F5-3` 实现“读取存档”按钮：调用 `gameApi.read(saveId)`，成功后跳转 `/game`
- [ ] `F5-4` 实现“删除存档”按钮：调用 `gameApi.delete(saveId)`，删除后自动刷新列表
- [ ] `F5-5` 实现“刷新列表”按钮 + 页面挂载时自动加载存档列表
- [ ] `F5-6` 存档页视觉设计：与登录页风格一致的深色主题

---

## Issue 3: `[Core] 实现游戏核心交互：场景导航、物品交互、玩家信息面板`

覆盖 `F6 + F7 + F8`，对应里程碑 `M3`

- [ ] `F6-1` 创建 `Game.vue` 页面，三栏布局（左侧玩家信息 / 中间场景 / 右侧排行榜）
- [ ] `F6-2` 实现方向导航按钮（W/A/S/D 四个箭头按钮），点击调用 `playerApi.move(direction)`
- [ ] `F6-3` 实现键盘监听：W/A/S/D 移动、R 回退、H 回城（`keydown` 事件）
- [ ] `F6-4` 移动后自动刷新当前房间信息（调用 `playerApi.getInfo` -> `roomApi.getInfo`）
- [ ] `F6-5` 页面挂载时自动加载当前房间信息，卸载时移除键盘监听
- [ ] `F7-1` 渲染当前房间物品列表（物品名称 / 重量 / 价值）
- [ ] `F7-2` 每个物品旁显示“拾取”按钮，点击调用 `backpackApi.pickItem(itemId)`
- [ ] `F7-3` 拾取后自动刷新房间物品列表
- [ ] `F8-1` 创建 `PlayerInfo.vue` 组件，展示玩家头像（图片或首字母占位）
- [ ] `F8-2` 展示玩家昵称、当前分数
- [ ] `F8-3` 展示体力值 + 体力条（`el-progress`，百分比 = `stamina / 200 * 100`）
- [ ] `F8-4` 组件挂载时自动调用 `playerApi.getInfo` 获取并刷新玩家信息

---

## Issue 4: `[Core] 实现背包系统与排行榜组件`

覆盖 `F9 + F10`，对应里程碑 `M3`

- [ ] `F9-1` 创建 `Backpack.vue` 组件，以弹窗（`el-dialog`）形式展示
- [ ] `F9-2` 背包弹窗内展示物品列表（物品名称 / 重量 / 价值）
- [ ] `F9-3` 每个物品旁显示“丢弃”按钮，调用 `backpackApi.dropItem(itemId)`
- [ ] `F9-4` 每个物品旁显示“使用”按钮，调用 `backpackApi.useItem(itemId)`（魔法饼干 / 体力药水）
- [ ] `F9-5` 背包弹窗打开时自动调用 `backpackApi.getList` 刷新背包内容
- [ ] `F9-6` 在 `Game.vue` 中集成背包弹窗（通过按钮或快捷键触发）
- [ ] `F10-1` 创建 `LeaderBoard.vue` 组件，固定在页面右侧
- [ ] `F10-2` 调用 `playerApi.getList` 获取所有在线玩家，按分数降序排列
- [ ] `F10-3` 每 5 秒轮询刷新排行榜（`setInterval`）
- [ ] `F10-4` 排行榜展示：排名序号 + 玩家昵称 + 分数（前三名高亮）

---

## Issue 5: `[Core] 实现回退/回城/传送功能`

覆盖 `F11`，对应里程碑 `M3`

- [ ] `F11-1` 实现 R 键回退功能：调用 `playerApi.back`，回到上一个房间
- [ ] `F11-2` 实现 H 键回城功能：调用 `playerApi.home`，一键返回入口大厅
- [ ] `F11-3` 实现传送房间自动触发：进入传送房间时自动调用 `playerApi.trans`
- [ ] `F11-4` 回退 / 回城 / 传送后自动刷新房间信息
- [ ] `F11-5` 在 UI 上添加 R/H 快捷键提示

---

## Issue 6: `[Core] 前端测试与代码质量保障`

覆盖 `F12`，对应里程碑 `M4`

- [ ] `F12-1` 编写 API 层单元测试（mock axios，验证各 API 函数调用参数正确）
- [ ] `F12-2` 编写 `Login.vue` 组件测试（表单渲染、登录/注册按钮点击触发 API）
- [ ] `F12-3` 编写 `Archive.vue` 组件测试（存档列表渲染、新建/读取/删除操作）
- [ ] `F12-4` 编写 `PlayerInfo.vue` 组件测试（玩家信息渲染、体力条百分比计算）
- [ ] `F12-5` 编写 `LeaderBoard.vue` 组件测试（排行榜排序、轮询刷新）
- [ ] `F12-6` 运行 ESLint 检查，确保 0 error
- [ ] `F12-7` 运行 Prettier 格式化，确保代码风格一致
- [ ] `F12-8` 运行 `vitest run`，确保所有测试通过

---

## 总结

| Issue | 标题 | 任务数 | 覆盖 F# |
| --- | --- | :---: | :---: |
| #1 | 搭建前端基础设施 | 15 | F1 + F2 + F3 |
| #2 | 登录注册与存档管理 | 11 | F4 + F5 |
| #3 | 游戏核心交互 | 12 | F6 + F7 + F8 |
| #4 | 背包系统与排行榜 | 10 | F9 + F10 |
| #5 | 回退 / 回城 / 传送 | 5 | F11 |
| #6 | 测试与代码质量 | 8 | F12 |

总计：`6` 个 Issue，`61` 个子任务。

---

## Issue 1 阶段补充修改建议

以下内容为当前需求基础上的补充约定，建议在 `Issue 1` 阶段统一明确：

### 1. 鉴权过期统一错误响应格式

无论最终采用 token 还是 session，前后端都应约定统一的“鉴权失效 / 过期”错误响应格式，便于前端统一拦截并跳转登录页。

建议至少统一以下字段：

```json
{
  "code": 401,
  "message": "auth expired",
  "data": null
}
```

### 2. 登录成功后的 token 返回格式

如果项目采用 token 鉴权，则应在 `POST /player/login` 成功返回中明确 token 字段格式，避免前端自行猜测字段名。

建议示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "playerId": 123,
    "token": "jwt-or-session-token"
  }
}
```

如果不采用 token，而采用 session，则前端 API 封装和路由守护应同步按 session 方案设计。

### 3. `/room/info` 返回可通行方向

当前 `/room/info` 是根据 `roomId` 请求房间信息。为了让前端直接判断哪些方向可走，建议在现有返回的 `data` 中增加“可通行方向”字段。

建议示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "roomId": 1,
    "roomName": "主城",
    "items": [],
    "doors": {
      "up": true,
      "down": false,
      "left": true,
      "right": false
    }
  }
}
```

这样前端可以在按钮态和键盘事件层直接拦截不存在的方向，避免无效请求打到后端。
