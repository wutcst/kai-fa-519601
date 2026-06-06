# 项目接口文档

本文档整理了当前项目约定使用的前后端接口。

说明：
- 所有返回体均为 JSON。
- 示例中的 `code = 200` 表示请求成功。
- `player/register` 的 `avatar` 字段已弃用，当前统一使用默认头像。

---

## 1. 玩家模块（Player）

### 1.1 登录

- 请求方式：`POST /player/login`
- 请求参数（JSON）：

```json
{
  "username": "string",
  "password": "string"
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "提示信息",
  "data": {
    "playerId": 123
  }
}
```

### 1.2 注册

- 请求方式：`POST /player/register`
- 请求参数（FormData）：
  - `playerName` (string)：用户名
  - `password` (string)：密码
  - `avatar` (File，可选)：头像文件，已弃用

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "提示信息",
  "data": {
    "playerId": 123
  }
}
```

### 1.3 玩家移动

- 请求方式：`POST /player/move`
- 请求参数（JSON）：

```json
{
  "direction": "up|down|left|right",
  "playerId": 123
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "提示信息",
  "data": {
    "roomId": 456
  }
}
```

### 1.4 返回上一房间

- 请求方式：`POST /player/back`
- 请求参数（JSON）：

```json
{
  "playerId": 123
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "roomId": 456
  }
}
```

### 1.5 传送（随机房间）

- 请求方式：`POST /player/trans`
- 请求参数（JSON）：

```json
{
  "playerId": 123
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "roomId": 456
  }
}
```

### 1.6 回城（回到主城）

- 请求方式：`POST /player/home`
- 请求参数（JSON）：

```json
{
  "playerId": 123
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success"
}
```

### 1.7 获取在线玩家列表

- 请求方式：`GET /player/list`

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "playerId": 1,
      "playerName": "玩家1",
      "playerAvatarUrl": "avatar1.png",
      "playerScore": 100
    }
  ]
}
```

### 1.8 获取玩家详细信息

- 请求方式：`POST /player/info`
- 请求参数（JSON）：

```json
{
  "playerId": 1
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "playerId": 1,
    "playerName": "玩家1",
    "playerAvatarUrl": "avatar1.png",
    "playerBackpackId": 1,
    "playerScore": 100,
    "playerRoomId": 1,
    "playerStamina": 80
  }
}
```

---

## 2. 房间模块（Room）

### 2.1 获取房间信息

- 请求方式：`POST /room/info`
- 请求参数（JSON）：

```json
{
  "roomId": 1
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "roomId": 1,
    "roomName": "主城",
    "items": [
      {
        "itemId": 101,
        "itemName": "魔法饼干",
        "itemSize": 1,
        "itemValue": 500
      }
    ]
  }
}
```

---

## 3. 背包模块（Backpack）

### 3.1 获取背包信息

- 请求方式：`POST /backpack/list`
- 请求参数（JSON）：

```json
{
  "playerId": 123
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "backpackId": 456,
    "backpackSize": 10,
    "itemList": [
      {
        "itemId": 101,
        "itemName": "魔法饼干",
        "itemSize": 1,
        "itemValue": 500
      }
    ]
  }
}
```

### 3.2 丢弃物品

- 请求方式：`POST /backpack/throw`
- 请求参数（JSON）：

```json
{
  "playerId": 123,
  "itemId": 101
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "item dropped successfully"
}
```

### 3.3 拾取物品

- 请求方式：`POST /backpack/pick`
- 请求参数（JSON）：

```json
{
  "playerId": 123,
  "itemId": 101
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "item picked up successfully"
}
```

### 3.4 使用物品

- 请求方式：`POST /backpack/use`
- 请求参数（JSON）：

```json
{
  "playerId": 123,
  "itemId": 101
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "item used successfully"
}
```

---

## 4. 游戏存档模块（Game）

### 4.1 获取存档列表

- 请求方式：`POST /game/list`
- 请求参数（JSON）：

```json
{
  "playerId": 1
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "saveId": 1,
      "playerId": 1,
      "saveTime": "2024-01-20T15:30:45",
      "playerScore": 100,
      "playerStamina": 80,
      "playerRoomId": 2
    }
  ]
}
```

### 4.2 创建新存档

- 请求方式：`POST /game/save`
- 请求参数（JSON）：

```json
{
  "playerId": 1
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success"
}
```

### 4.3 读取存档

- 请求方式：`POST /game/read`
- 请求参数（JSON）：

```json
{
  "saveId": 1
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "playerId": 1,
    "playerName": "玩家1",
    "playerScore": 100,
    "playerStamina": 80,
    "playerRoomId": 2,
    "playerBackpackId": 1,
    "saveTime": "2024-01-20T15:30:45"
  }
}
```

### 4.4 删除存档

- 请求方式：`POST /game/delete`
- 请求参数（JSON）：

```json
{
  "saveId": 1
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success"
}
```

### 4.5 新建游戏

- 请求方式：`POST /game/new`
- 请求参数（JSON）：

```json
{
  "playerId": 1
}
```

- 返回数据（JSON）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "playerId": 1
  }
}
```

---

## 5. 接口汇总表

| 序号 | 模块 | 接口名称 | 请求方式 | URL |
| --- | --- | --- | --- | --- |
| 1 | Player | 登录 | POST | `/player/login` |
| 2 | Player | 注册 | POST | `/player/register` |
| 3 | Player | 玩家移动 | POST | `/player/move` |
| 4 | Player | 返回上一房间 | POST | `/player/back` |
| 5 | Player | 传送（随机房间） | POST | `/player/trans` |
| 6 | Player | 回城（回到主城） | POST | `/player/home` |
| 7 | Player | 获取在线玩家列表 | GET | `/player/list` |
| 8 | Player | 获取玩家详细信息 | POST | `/player/info` |
| 9 | Room | 获取房间信息 | POST | `/room/info` |
| 10 | Backpack | 获取背包信息 | POST | `/backpack/list` |
| 11 | Backpack | 丢弃物品 | POST | `/backpack/throw` |
| 12 | Backpack | 拾取物品 | POST | `/backpack/pick` |
| 13 | Backpack | 使用物品 | POST | `/backpack/use` |
| 14 | Game | 获取存档列表 | POST | `/game/list` |
| 15 | Game | 创建新存档 | POST | `/game/save` |
| 16 | Game | 读取存档 | POST | `/game/read` |
| 17 | Game | 删除存档 | POST | `/game/delete` |
| 18 | Game | 新建游戏 | POST | `/game/new` |
