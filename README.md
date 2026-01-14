# Allowlist Generator (网络策略生成器)

一个基于 React 的强大工具，用于生成、校验和管理网络防火墙白名单配置。

[English Documentation](README_EN.md) | [开发日志](DEV_JOURNAL.md)

## 🚀 核心功能

*   **智能 IP 分割**：自动将大型 CIDR 网段切割成易于管理的小块（每行最多 20 个 IP）。
*   **严格校验**：
    *   严格验证 IPv4 格式。
    *   **自动排除** 网络地址 (`.0`) 和 广播地址 (`.255`)，确保生成的规则安全可用。
    *   自动检测跨策略的重复 IP。
*   **智能解析**：支持导入现有的 `.txt` 配置文件。
*   **可视化管理**：
    *   提供易用的表格界面来管理复杂的策略。
    *   支持批量操作（复制、删除）。
    *   实时校验反馈。
*   **预览导出**：一键生成最终配置文本并导出。

## 🛠 技术栈

*   **前端框架**: React, TypeScript, Vite
*   **样式库**: Tailwind CSS (v4)
*   **图标库**: Lucide React
*   **测试框架**: Vitest, React Testing Library

## 📦 快速开始

### 前置要求

*   Node.js (建议 v18 或更高)
*   npm 或 yarn

### 安装步骤

1.  克隆仓库：
    ```bash
    git clone https://github.com/your-username/allowlist-generator.git
    cd allowlist-generator
    ```

2.  安装依赖：
    ```bash
    npm install
    ```

3.  启动开发服务器：
    ```bash
    npm run dev
    ```

## 🧪 运行测试

本项目包含一套全面的测试套件，覆盖了底层算法逻辑（IP 计算）和用户操作流程（User Validations）。

```bash
# 运行所有测试
npm test

# 带 UI 界面运行测试
npm run test:ui
```

## 📝 配置文件格式规范

本工具支持导入/导出以下格式的文本文件：

```text
策略描述 协议 起始端口 结束端口 IP地址
策略描述 协议 起始端口 结束端口 起始IP-结束IP
```

示例：
```text
Web服务器 tcp 80 80 192.168.1.100
数据库集群 tcp 3306 3306 10.0.0.1-10.0.0.20
```

## 📄 开源协议

MIT

## 🤖 AI 协作声明

本项目是 **人机协作 (Human-AI Pair Programming)** 的实践成果。

从核心算法实现、全链路测试编写到文档自动生成，均由开发者与 **Antigravity** (Google DeepMind 研发的 Advanced Agentic Coding Assistant) 共同完成。这是一个展示 AI 如何赋能现代软件工程的开源案例。
