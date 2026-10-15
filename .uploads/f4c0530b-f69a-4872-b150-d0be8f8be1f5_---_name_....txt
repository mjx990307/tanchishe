---
name: "sandbox-dev"
description: "本地 AI-Agent 开发调试指南。用于本地初始化环境、启动 ai-agent、编写测试脚本、调试和排查问题。"
---

# Sandbox Local Development Guide

本地开发调试 Remote AI-Agent 的完整指南。

## 触发条件

当用户需要以下操作时调用此 skill：
- 本地初始化开发环境
- 启动 ai-agent 服务
- 编写或运行测试脚本
- 调试 AI-Agent 问题
- 排查本地运行问题

## 项目位置

本地开发环境位于：`sandbox-local-dev/`

## 快速开始

### 1. 首次配置

```bash
cd sandbox-local-dev
make setup
```

配置向导会自动：
- 检测依赖工具（node, cargo, supervisord, bdjwt, jq）
- 扫描 `~` 目录下的相关仓库（icube-mono, agent-toolhost）
- 引导设置用户信息（name, region, user_id）
- 生成 `.env.local` 配置文件（不提交到 Git）

### 2. 构建组件

```bash
make build-local
```

构建以下组件：
| 组件 | 源码/来源 | 输出 |
|------|----------|------|
| ai-agent | `$ICUBE_MONO_DIR/apps/icube_server_rs/modules/ai-agent` | output/bin/ai-agent |
| sentinel | `$TRAE_REMOTE_SANDBOX_DIR/sentinel` | output/bin/sentinel |
| agent-tool-host | `$AGENT_TOOLHOST_DIR` | output/bin/agent-tool-host |
| ckg-server | 从 CDN 下载预编译二进制 | output/bin/ckg_server |

### 3. 启动服务

```bash
make run-local
```

启动服务（使用 supervisord 管理）：
| 服务 | 端口 | 说明 |
|------|------|------|
| ai-agent | 40015 | AI Agent 主服务（HTTP/WebSocket） |
| agent-tool-host | 8999 | 工具执行服务（RPC） |
| ckg-server | 51008 | 代码知识图谱服务 |
| sentinel | 19090 | 会话状态监控服务 |

### 4. 运行测试

```bash
# 在宿主机终端运行（不是沙箱内）
make test-local

# 运行指定测试文件
make test-local FILE=tests/http.spec.ts
```

> **重要**: 测试需要在**宿主机终端**运行，因为 `bdjwt` 命令需要访问系统文件锁。

---

## 测试流程指南

### 完整测试流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        测试工作流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 修改代码（ai-agent / sentinel / agent-tool-host）            │
│         ↓                                                       │
│  2. 删除对应的二进制文件（重要！）                                  │
│     rm -f output/bin/<component>                                │
│         ↓                                                       │
│  3. 重新构建                                                     │
│     make build-local                                            │
│         ↓                                                       │
│  4. 启动服务（终端 A）                                            │
│     make run-local                                              │
│         ↓                                                       │
│  5. 运行测试（终端 B）                                            │
│     make test-local FILE=tests/your-test.spec.ts                │
│         ↓                                                       │
│  6. 查看结果和日志                                               │
│     tail -f output/run/log/ai-agent.log                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

> **重要**: `make build-local` 会检查 `output/bin/` 中的二进制文件是否存在，**如果存在则跳过构建**。因此修改代码后必须先删除对应的二进制文件，否则不会重新构建！

### 快速迭代命令

```bash
# 修改 ai-agent 后重新构建
rm -f output/bin/ai-agent && make build-local && make run-local

# 修改 sentinel 后重新构建
rm -f output/bin/sentinel && make build-local && make run-local

# 修改 agent-tool-host 后重新构建
rm -f output/bin/agent-tool-host && make build-local && make run-local

# 修改多个组件后重新构建
rm -f output/bin/ai-agent output/bin/sentinel && make build-local && make run-local

# 强制全部重新构建（删除所有二进制）
rm -f output/bin/* && make build-local && make run-local

# 在另一个终端运行测试
make test-local FILE=tests/your-test.spec.ts
```

### 测试前检查清单

1. **确认服务已启动**
   ```bash
   curl -s -X POST http://localhost:40015/api/v1/healthcheck/ping \
     -H "Content-Type: application/json" -d '{"data":{}}'
   ```

2. **确认端口没有被占用**
   ```bash
   lsof -i :40015  # 应该显示 ai-agent 进程
   ```

3. **确认 Token 有效**
   ```bash
   make refresh-token  # 如果测试失败可以先刷新 token
   ```

---

## 编写测试脚本

### 测试文件位置

所有测试脚本放在 `sandbox-local-dev/tests/` 目录下，文件名格式：`*.spec.ts`

### 快速创建测试

推荐使用模板文件快速创建新测试：

```bash
# 复制模板文件
cp tests/_template.spec.ts tests/your-test.spec.ts

# 编辑测试文件，修改以下内容：
# 1. 测试名称（test('TODO: 修改测试名称', ...)）
# 2. 测试问题（const query = '...'）
# 3. 添加测试断言

# 运行测试
make test-local FILE=tests/your-test.spec.ts
```

### 模板文件

模板文件位置：`tests/_template.spec.ts`

模板包含：
- 完整的会话初始化流程
- start_chat 调用
- SSE 事件订阅和处理
- 超时保护和错误处理
- TODO 标记指示需要修改的地方

### 基本模板（供参考）

```typescript
import test from 'node:test';
import { getTestWorkspaceDir, generateSessionId, inspect, sleep } from './common.js';
import { HttpSession } from '../client/lib/session.http.js';
import { defaultContextInfo, defaultCustomModel, defaultAgent } from '../client/lib/input.js';

test('测试名称', async () => {
  const workspaceDir = getTestWorkspaceDir();
  const bizProjectId = generateSessionId();
  const connectSessionId = generateSessionId();
  const chatSessionId = generateSessionId();
  
  inspect('测试参数', { workspaceDir, bizProjectId, connectSessionId, chatSessionId });

  // 1. 初始化会话
  const session = new HttpSession({ ...defaultContextInfo });
  session.updateWorkspaceFolder(workspaceDir);
  session.updateProjectId(bizProjectId);
  session.updateConnectSessionId(connectSessionId);
  session.context.client_info.chat_session_id = chatSessionId;
  session.context.client_info.forwarded_from_local = true;

  // 2. 创建会话
  inspect('步骤 1: chat.initialize');
  const initRes = await session.initializeSession();
  inspect('chat.initialize 响应', initRes);

  if (!initRes.session?.session_id) {
    throw new Error('chat.initialize 响应缺少 session_id');
  }

  // 3. 发起对话
  inspect('步骤 2: start_chat');
  const query = '你的测试问题';
  const agentType = 'solo_coder';
  const modelName = 'gpt-5';
  
  const startChatRes = await session.startChat(
    agentType, 
    modelName, 
    query, 
    defaultCustomModel, 
    defaultAgent
  );
  inspect('start_chat 响应', startChatRes);

  if (!startChatRes.turn_id) {
    throw new Error('start_chat 响应缺少 turn_id');
  }

  // 4. 订阅 SSE 事件流
  inspect('步骤 3: subscribe_events');
  const events: any[] = [];

  for await (const event of session.subscribeEvents()) {
    events.push(event);
    const eventType = event.data?.event || event.event;
    inspect(`收到事件: ${eventType}`);

    if (eventType === 'done') {
      inspect('收到 done 事件，测试完成');
      break;
    }

    if (eventType === 'error') {
      throw new Error(`收到 error 事件: ${JSON.stringify(event.data)}`);
    }

    // 超时保护
    if (events.length > 100) {
      throw new Error('事件数量超过 100，可能存在问题');
    }
  }

  inspect('测试通过', { totalEvents: events.length });
});
```

### 完整示例：测试 error 处理和 cleanup

```typescript
import test from 'node:test';
import { getTestWorkspaceDir, generateSessionId, inspect, sleep } from './common.js';
import { HttpSession } from '../client/lib/session.http.js';
import { defaultContextInfo, defaultCustomModel, defaultAgent } from '../client/lib/input.js';

/**
 * 测试 error event 后 cleanup 是否正确执行
 * 
 * 场景：
 * 1. 第一次 start_chat 使用无效的 model 配置，触发 error event
 * 2. 第二次 start_chat 使用正常配置，验证能正常收到 done event
 */
test('HTTP 链路：error event cleanup 测试', async () => {
  const workspaceDir = getTestWorkspaceDir();
  const bizProjectId = generateSessionId();
  const connectSessionId = generateSessionId();
  const chatSessionId = generateSessionId();

  const session = new HttpSession({ ...defaultContextInfo });
  session.updateWorkspaceFolder(workspaceDir);
  session.updateProjectId(bizProjectId);
  session.updateConnectSessionId(connectSessionId);
  session.context.client_info.chat_session_id = chatSessionId;
  session.context.client_info.forwarded_from_local = true;

  // 步骤 1: 初始化
  const initRes = await session.initializeSession();
  if (!initRes.session?.session_id) {
    throw new Error('chat.initialize 响应缺少 session_id');
  }

  // 步骤 2: 第一次 chat（触发错误）
  inspect('第一次 chat: 使用无效模型');
  const invalidModel = {
    ...defaultCustomModel,
    config_name: 'nonexistent-model-12345',
    display_model_name: 'Invalid Model',
  };

  let errorReceived = false;
  try {
    await session.startChat('solo_coder', 'nonexistent-model-12345', 'test', invalidModel, defaultAgent);
    
    for await (const event of session.subscribeEvents()) {
      const eventType = event.data?.event || event.event;
      if (eventType === 'error') {
        errorReceived = true;
        inspect('收到预期的 error 事件');
        break;
      }
      if (eventType === 'done') break;
    }
  } catch (e) {
    errorReceived = true;
  }

  inspect('第一次 chat 结果', { errorReceived });

  // 等待 cleanup
  await sleep(2000);

  // 步骤 3: 第二次 chat（正常流程）
  inspect('第二次 chat: 使用正常模型');
  let doneReceived = false;

  await session.startChat('solo_coder', 'gpt-5', 'Say hello', defaultCustomModel, defaultAgent);

  for await (const event of session.subscribeEvents()) {
    const eventType = event.data?.event || event.event;
    if (eventType === 'done') {
      doneReceived = true;
      break;
    }
    if (eventType === 'error') {
      throw new Error('第二次 chat 不应该收到 error');
    }
  }

  // 验证
  if (!doneReceived) {
    throw new Error('第二次 chat 应该收到 done 事件');
  }

  inspect('✅ 测试通过：error 后 cleanup 正确执行');
});
```

### 可用的工具函数

| 函数 | 说明 |
|------|------|
| `getTestWorkspaceDir()` | 获取测试用的 workspace 目录 |
| `generateSessionId()` | 生成随机的 session id（24 位十六进制） |
| `sleep(ms)` | 等待指定毫秒数 |
| `inspect(message, ...values)` | 打印带时间戳的调试信息 |
| `saveLogToFile(name, log)` | 保存日志到文件 |
| `checkAiAgentLog(workspaceDir, chatSessionId)` | 检查 ai-agent 日志 |

### HttpSession 常用方法

| 方法 | 说明 |
|------|------|
| `initializeSession()` | 初始化聊天会话 |
| `startChat(agentType, modelName, query, customModel, agent, messageId?)` | 发起对话 |
| `subscribeEvents()` | 订阅 SSE 事件流（异步迭代器） |
| `getMessages()` | 获取消息列表 |
| `getMessageAiEditFileDiffList(messageId, toolcallIds?)` | 获取文件 diff 列表 |
| `updateWorkspaceFolder(path)` | 更新 workspace 路径 |
| `updateProjectId(id)` | 更新项目 ID |
| `updateConnectSessionId(id)` | 更新连接会话 ID |
| `getSessionId()` | 获取当前会话 ID |

### 常见事件类型

| 事件类型 | 说明 |
|----------|------|
| `metadata` | 元数据事件，包含 turn_id、message_id 等 |
| `session_title_message` | 会话标题消息 |
| `plan_item` | 计划项事件（工具调用） |
| `content` | 内容事件（AI 回复文本） |
| `token_usage` | Token 使用量统计 |
| `heartbeat` | 心跳事件（每 5 秒） |
| `done` | 完成事件 |
| `error` | 错误事件 |

### 运行测试

```bash
# 运行单个测试文件
make test-local FILE=tests/your-test.spec.ts

# 带环境变量运行
PROMPT="执行 ls 命令" make test-local FILE=tests/http.chat_initialize.spec.ts

# 直接使用 tsx（需要先刷新 token）
make refresh-token
npx tsx --env-file=.env.local --test tests/your-test.spec.ts
```

---

## 目录结构

```
sandbox-local-dev/
├── Makefile                    # Make 命令入口
├── .env.local                  # 本地配置（不提交）
├── conf/                       # 配置文件
│   ├── ai_config_cn_bd.json
│   └── ide_dynamic_config*.json
├── scripts/                    # 脚本目录
│   ├── setup.sh                # 首次配置向导
│   ├── build-local.sh          # 统一构建入口
│   ├── build-*.sh              # 各组件构建脚本
│   ├── run-local.sh            # 运行服务
│   ├── pre-run-local.sh        # 运行前准备
│   └── refresh-token.sh        # JWT token 刷新脚本
├── client/                     # 客户端代码
│   └── lib/                    # 库代码
│       ├── input.ts            # 环境配置和默认参数
│       ├── logger.ts           # 日志工具
│       ├── types.ts            # TypeScript 类型定义
│       └── session.http.ts     # HTTP 会话客户端
├── tests/                      # 测试代码
│   ├── _template.spec.ts       # 测试脚本模板（复制此文件创建新测试）
│   ├── common.ts               # 测试工具函数
│   ├── http.spec.ts            # 基础 HTTP 测试
│   ├── http.chat_initialize.spec.ts  # 完整流程测试
│   └── http.error_cleanup.spec.ts    # error cleanup 测试
└── output/                     # 构建输出
    ├── bin/                    # 二进制文件
    ├── lib/                    # 动态库
    ├── config/                 # 运行时配置
    └── run/                    # 运行时目录和日志
```

## 常用命令

```bash
# 查看所有命令
make help

# 首次配置或重新配置
make setup

# 构建所有组件
make build-local

# 启动所有服务
make run-local

# 清理构建产物
make clean

# 刷新 JWT token（需要在宿主机终端运行）
make refresh-token

# 运行所有测试（需要在宿主机终端运行）
make test-local

# 运行指定测试文件
make test-local FILE=tests/http.spec.ts

# 仅构建 ai-agent
./scripts/build-ai-agent.sh

# 仅构建 sentinel
./scripts/build-sentinel.sh
```

## HTTP API 接口

### 基础 URL

```
http://localhost:40015
```

### 主要接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/healthcheck/ping` | POST | 健康检查 |
| `/api/v1/project/create_project` | POST | 创建项目 |
| `/api/v1/chat/create_session` | POST | 创建会话 |
| `/api/v1/chat/initialize` | POST | 初始化聊天 |
| `/api/v1/chat/start_chat` | POST | 发起对话 |
| `/api/v1/chat/subscribe_events` | POST | SSE 事件订阅 |
| `/api/v1/chat/get_messages` | POST | 获取消息列表 |
| `/api/v1/snapshot/get_message_ai_edit_file_diff_list` | POST | 获取文件 diff 列表 |

### 使用 curl 测试

```bash
# 健康检查
curl -s -X POST http://localhost:40015/api/v1/healthcheck/ping \
  -H "Content-Type: application/json" \
  -d '{"data":{}}'
# 预期返回: {"message":"success","code":0,"data":{"message":"pong"}}
```

## 调试技巧

### 1. 查看服务日志

```bash
# 查看 ai-agent 日志
tail -f output/run/log/ai-agent.log

# 查看 agent-tool-host 日志
tail -f output/run/log/agent-tool-host.log

# 查看 sentinel 日志
tail -f output/run/log/sentinel.log

# 查看 supervisord 日志
tail -f output/run/log/supervisord.log
```

### 2. 检查端口占用

```bash
lsof -i :40015  # ai-agent
lsof -i :8999   # agent-tool-host
lsof -i :51008  # ckg-server
lsof -i :19090  # sentinel
```

### 3. 手动启动单个服务

```bash
# 启动 ai-agent（需要正确的环境变量）
./output/run/start-ai-agent.sh

# 或者使用完整路径
RUST_LOG=debug ./output/bin/ai-agent
```

### 4. 调试 JWT Token

```bash
# 手动生成 token（必须在宿主机终端运行）
bdjwt gen

# 检查 token 是否有效
bdjwt info <token>

# 刷新 .env.local 中的 token
make refresh-token
```

> **注意**: `bdjwt` 命令不能在沙箱环境中运行（缺少文件锁权限），必须在宿主机终端直接执行。

### 5. 验证服务状态

```bash
# 检查服务进程
ps aux | grep ai-agent
ps aux | grep sentinel

# 检查服务健康
curl -s -X POST http://localhost:40015/api/v1/healthcheck/ping \
  -H "Content-Type: application/json" \
  -d '{"data":{}}'
```

## 常见问题

### Q: `make setup` 找不到仓库？

A: setup 脚本会扫描 `~` 目录下的所有 git 仓库，通过检测 `git remote origin` URL 来识别：
- **icube-mono**: `git@code.byted.org:ide/icube-mono.git`
- **agent-toolhost**: `git@code.byted.org:ide/agent-toolhost.git`

如果自动扫描失败，可以手动编辑 `.env.local` 指定路径。

### Q: ai-agent 启动失败，提示缺少动态库？

A: 构建脚本会自动从 `ai-agent/deps/ttnet/` 复制 ttnet 动态库到 `output/lib/`。如果启动失败：
```bash
# 检查动态库是否存在
ls -la output/lib/libsscronet*

# 检查 DYLD_LIBRARY_PATH 是否正确设置（macOS）
echo $DYLD_LIBRARY_PATH

# 手动运行时指定库路径
DYLD_LIBRARY_PATH="$PWD/output/lib" ./output/bin/ai-agent
```

### Q: 端口被占用？

A: 运行 `make run-local` 前会自动清理端口。也可以手动清理：
```bash
# 停止所有相关进程
pkill -f supervisord
pkill -f ai-agent
pkill -f agent-tool-host
pkill -f sentinel

# 重新启动
make run-local
```

### Q: 测试连接超时？

A: 检查服务是否正常运行：
```bash
# 检查服务进程
ps aux | grep ai-agent
ps aux | grep sentinel

# 检查服务健康
curl -s -X POST http://localhost:40015/api/v1/healthcheck/ping \
  -H "Content-Type: application/json" \
  -d '{"data":{}}'
```

### Q: 如何修改 AI Agent 配置？

A: 编辑 `conf/ai_config_cn_bd.json`，然后重启服务。

### Q: bdjwt 命令不存在或报权限错误怎么办？

**错误信息 1** - 命令不存在:
```
Error: 'bdjwt' command not found
```

**错误信息 2** - 权限错误（在沙箱中运行）:
```
Failed to create persistent cookie jar: cannot load cookies: file locked for too long
open /Users/xxx/.bdjwt/cookies.lock: operation not permitted
```

**解决方案**:

1. **安装 bdjwt**: 如果命令不存在，请先安装：
   - 安装文档：https://bytedance.larkoffice.com/wiki/ZiUvwvBSTiIGDwkezUVcPJ1Wnyh

2. **权限错误**: `bdjwt` 命令不能在沙箱环境中运行（缺少文件锁权限）
   - 必须在**宿主机终端**直接执行 `bdjwt gen`
   - `make test-local` 和 `make refresh-token` 都需要在宿主机终端运行

### Q: Token 过期导致测试失败？

A: 运行 `make refresh-token` 刷新 token，或者让 `make test-local` 自动刷新。

### Q: 如何触发 error event 进行测试？

A: 有几种方法可以触发 error event：

1. **使用无效的模型配置**（推荐）:
   ```typescript
   const invalidModel = {
     ...defaultCustomModel,
     config_name: 'nonexistent-model-12345',
   };
   await session.startChat('solo_coder', 'nonexistent-model-12345', 'test', invalidModel, defaultAgent);
   ```

2. **断开网络连接**: 断网后发起对话，LLM 请求会超时失败

3. **配置错误的代理**: 设置不存在的代理服务器地址

## 配置说明

`.env.local` 文件包含以下配置：

| 变量 | 说明 |
|------|------|
| `ICUBE_MONO_DIR` | icube-mono 仓库路径 |
| `AGENT_TOOLHOST_DIR` | agent-toolhost 仓库路径 |
| `AGENT_USER_INFO` | 用户认证信息（JSON 格式，包含 name、token、region 等） |

## 相关 Skills

- `sandbox-debug` - 远程沙箱调试
- `explorer-debug` - Explorer 调试

## 文档

- 详细规格说明：`sandbox-local-dev/docs/SPEC.md`
- README：`sandbox-local-dev/README.md`
