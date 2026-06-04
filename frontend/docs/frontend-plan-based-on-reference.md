# Zuulventurers 前端方案

## 1. 方案目标

本方案参考 `C:\Users\29768\Downloads\软件工程实践小游戏\se22-sept2-zuulventurers-master\frontend` 下的前端页面设计与页面流转，但严格以当前仓库已经存在的后端接口为边界，不假设不存在的能力。

目标有四个：

- 保留参考项目的页面层次和游戏氛围。
- 让当前前端先完整跑通现有后端的玩家接口。
- 对尚未落地的游戏能力做可见但不可误用的占位。
- 为后续 `room`、`backpack`、`game/save` 接口补齐后保留扩展位。

## 2. 参考项目页面结论

参考项目的核心页面流转是：

`Welcome -> Login/Register -> Archive -> Game`

值得借鉴的不是它的具体实现细节，而是这套产品结构：

- `Welcome` 负责氛围建立和主入口。
- `Login/Register` 负责合并认证入口，视觉上是统一卡片。
- `Archive` 不是普通表格，而是“继续冒险 / 角色入口”页面。
- `Game` 是稳定的 HUD 布局，不是简单按钮堆叠。

参考项目在视觉上还有几个明显特征：

- 全屏背景图或轮播背景。
- 半透明卡片和悬浮装饰。
- 进入游戏前有较强的品牌感和沉浸感。
- 游戏页拆成信息区、场景区、提示区、排行榜区。

这些结构适合迁移到当前仓库。

## 3. 当前仓库后端现状

当前后端实际只开放了 `player` 域接口，入口见 `backend/app/main.py`，已挂载的路由见 `backend/app/routers/player.py`。

当前真实可用接口只有：

- `POST /player/login`
- `POST /player/register`
- `POST /player/info`
- `GET /player/list`

当前前端 `frontend/src/api/index.ts` 已经预埋了很多并不存在的调用：

- `player.move`
- `player.trans`
- `player.back`
- `player.home`
- `room.getInfo`
- `backpack.*`
- `game.*`

这意味着当前前端的问题不是“页面太简陋”这么简单，而是“页面结构预期已经超前于后端实现”。因此方案必须分阶段。

## 4. 页面级方案

保留现有路由骨架：

- `/welcome/login`
- `/welcome/archive`
- `/game`

对应文件继续由以下视图承接：

- `frontend/src/views/Welcome.vue`
- `frontend/src/views/Login.vue`
- `frontend/src/views/Archive.vue`
- `frontend/src/views/Game.vue`

### 4.1 Welcome 页面

目标：把当前纯色容器升级成真正的欢迎页壳子。

建议结构：

- 全屏背景层：静态插画或轮播背景。
- 中央主视觉区：标题、副标题、主按钮、次按钮。
- 主按钮：`登录 / 注册`
- 次按钮：`游戏介绍`
- 内部仍保留 `router-view`，让登录页和角色入口页作为 welcome 子页面渲染。

这部分不依赖后端，可以最先改。

### 4.2 Login/Register 页面

目标：对齐参考项目的统一认证卡片，但只接当前已存在接口。

登录模式：

- 用户名
- 密码
- 提交到 `POST /player/login`

注册模式：

- 用户名
- 密码
- 确认密码
- 可选头像上传
- 提交到 `POST /player/register`

交互要求：

- 登录成功后保存 `playerId`
- 不保存伪 token，因为当前后端没有认证 token
- 注册成功后切回登录态
- 错误提示统一基于后端返回的 `code/message/data`

注意点：

- 当前后端 `register` 接口的头像是可选的，因此注册页不应强制上传头像。
- 当前 `Login.vue` 已有基础登录注册逻辑，可以保留数据流，只重做页面结构。

### 4.3 Archive 页面

目标：不再把它当“存档表格页”，而是改造成“当前角色入口页”。

原因：

- 当前后端没有任何 `game/save` 相关接口。
- 继续保留表格式存档页只会制造大量 404。

建议改法：

- 保留参考项目的“卡片式槽位 / 继续冒险”视觉语言。
- 但在当前阶段只展示一个“当前玩家卡片”。
- 数据来源改为 `POST /player/info`。

页面内容建议：

- 玩家名
- 当前体力
- 当前分数
- 当前房间 ID
- 主按钮：`进入冒险`
- 次按钮：`返回欢迎页`

也就是说，`Archive` 在当前阶段承担的是“角色确认页”，不是“存档管理页”。

### 4.4 Game 页面

目标：先做成“支持现有接口的游戏壳子”，不要伪造完整玩法。

建议保留的布局区域：

- 左上：玩家信息 `PlayerInfo`
- 右上或右侧：排行榜 `LeaderBoard`
- 中央：场景舞台占位区
- 底部：房间叙述 / 当前状态提示
- 浮动区域：按键提示

当前阶段只允许接入真实可用数据：

- `playerApi.getInfo()`
- `playerApi.getList()`

当前阶段必须禁用或占位的能力：

- 移动
- 房间详情
- 房间物品拾取
- 背包管理
- 存档读写

推荐文案策略：

- 场景区显示 `Room #<player_room_id>`
- 同时给出说明：
  - “当前后端仅开放玩家接口，房间详情、移动、背包、存档功能待后端补齐后启用。”
- WASD / R / H 按钮可以保留视觉样式，但需要 disabled 状态和提示文案。

这样做的好处是：

- 页面观感已经像游戏。
- 用户不会点一下就撞到 404。
- 后端一旦补齐，布局不需要推翻重做。

## 5. 组件拆分建议

### 5.1 当前文件继续保留

- `views/Welcome.vue`
  - 升级为欢迎页壳子。
- `views/Login.vue`
  - 合并登录态和注册态。
- `views/Archive.vue`
  - 从存档表格改为角色入口卡片。
- `views/Game.vue`
  - 保留 HUD 布局，移除不存在接口的硬调用。

### 5.2 现有组件继续复用

- `components/PlayerInfo.vue`
  - 继续负责玩家摘要信息。
- `components/LeaderBoard.vue`
  - 继续负责玩家榜单显示。

### 5.3 推荐新增组件

建议按需新增：

- `components/WelcomeHero.vue`
  - 欢迎页主视觉与按钮区。
- `components/AuthCard.vue`
  - 登录注册统一卡片外壳。
- `components/ArchiveProfileCard.vue`
  - 角色入口卡片。
- `components/GameStagePlaceholder.vue`
  - 游戏中心舞台占位。
- `components/GameKeyHints.vue`
  - 键位提示区。

如果想先快做，也可以第一版先全部写在视图文件里，稳定后再拆组件。

## 6. 前端接口层调整方案

当前 `frontend/src/api/index.ts` 最大的问题不是实现写法，而是把大量不存在的接口包装成了“已可调用状态”。

建议调整为两层：

### 6.1 当前立即保留

- `playerApi.login`
- `playerApi.register`
- `playerApi.getInfo`
- `playerApi.getList`

### 6.2 当前立即下线或隔离

- `player.move`
- `player.trans`
- `player.back`
- `player.home`
- `room.*`
- `backpack.*`
- `game.*`

推荐做法：

- 在页面内不再调用这些不存在的 wrapper。
- 可以在代码里暂时保留注释区，标明未来预计接口名。
- 只有后端真补齐后，再恢复这些 wrapper 的页面接入。

### 6.3 返回结构统一处理

建议新增一个很薄的结果处理工具，例如：

- `isSuccess(res) => res.data?.code === 200`
- `getMessage(res) => res.data?.message || '请求失败'`
- `getPayload(res) => res.data?.data`

好处：

- 页面逻辑更干净。
- 不会到处散落 `res.data.code === 200`。
- 后续若结果结构调整，也只需要改一处。

## 7. 状态与导航方案

当前阶段不需要引入全局状态库，使用最简单方案即可：

- 身份状态：`localStorage.playerId`
- 不使用 token store
- 不引入 Pinia/Vuex

导航规则建议：

- 没有 `playerId` 时：
  - 默认进 `/welcome/login`
- 有 `playerId` 时：
  - 允许进 `/welcome/archive`
- 登录成功后：
  - `router.push('/welcome/archive')`
- 从角色入口进入游戏：
  - `router.push('/game')`
- 退出登录时：
  - 清掉 `playerId`
  - 回到 `/welcome/login`

建议补一个轻量路由守卫：

- `/welcome/archive` 需要登录
- `/game` 需要登录

## 8. 视觉方向建议

这次前端不建议继续沿用当前仓库偏“练习作业感”的页面样式，而应直接向参考项目靠拢，但保留更克制的实现范围。

视觉方向：

- `Welcome`：强氛围、强品牌感
- `Login/Register`：沉浸式卡片认证
- `Archive`：角色入口 / 继续冒险
- `Game`：HUD 覆盖式游戏界面

统一规则：

- `Welcome / Login / Archive` 共用一套背景系统
- 面板用半透明毛玻璃卡片
- 按钮做成较强的游戏风格 hover 状态
- 兼顾移动端布局
- 避免再使用纯表格 + 纯按钮的后台风界面

## 9. 分阶段落地

### Phase A：当前后端即可落地

- 重做 `Welcome.vue`
- 重做 `Login.vue`
- 把 `Archive.vue` 改成角色入口页
- 把 `Game.vue` 改成支持真实数据的壳子页
- 清理 `api/index.ts` 中对不存在接口的页面调用
- 确保登录、注册、读取玩家信息、查看排行榜全部走通

结果：

- 可以注册
- 可以登录
- 可以进入角色入口页
- 可以进入游戏主壳页
- 不会再因为点按钮触发一堆 404

### Phase B：为后端扩展预留 UI 钩子

- 保留禁用态方向按钮
- 保留背包区占位
- 保留角色入口页向存档页演化的槽位布局
- 保留游戏场景区未来接 room 数据的接口位置

结果：

- 后续后端补接口时不需要大改页面结构

### Phase C：后端补齐后恢复完整玩法

需要后端补齐的接口包括：

- `/player/move`
- `/player/back`
- `/player/home`
- `/player/trans`
- `/room/info`
- `/backpack/list`
- `/backpack/pick`
- `/backpack/throw`
- `/backpack/use`
- `/game/list`
- `/game/save`
- `/game/read`
- `/game/delete`
- `/game/new`

等这些接口都存在后，再把参考项目里的完整游戏交互逐步接回去。

## 10. 建议的实现顺序

建议按下面顺序做，收益最高，返工最少：

1. 清理 `frontend/src/api/index.ts`，移除页面对不存在接口的实际调用。
2. 重做 `Welcome.vue` 和 `Login.vue`。
3. 把 `Archive.vue` 从存档表格改成角色入口页。
4. 把 `Game.vue` 改成真实可跑的数据壳子页。
5. 最后补路由守卫、统一错误提示和空状态文案。

## 11. 最大风险

这版前端最大的风险不是样式实现，而是“页面表现假装功能已存在”。

因此本方案的核心原则只有一句：

- 页面体验可以先对齐参考项目，
- 但任何当前后端不支持的能力，都不能继续以可点击、可调用、可误解的方式暴露给用户。

具体体现为：

- 没有 save API，就不要继续做真存档页
- 没有 move API，就不要让方向操作真的发请求
- 没有 room API，就不要假装有真实房间详情
- 没有 backpack API，就不要保留会 404 的拾取和背包动作

这样做，前端才会从“接口前置假实现”回到“可交付的真实产品状态”。
