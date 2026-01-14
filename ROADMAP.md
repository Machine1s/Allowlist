# 🗺️ Roadmap - Allowlist Generator

## v1.1: Dual-Network (AB网) 智能支持 (Next Priority)
> 目标：解决双平面/双网段（如生产网 A平面/B平面）配置重复操作的痛点。

- [ ] **AB 网段映射规则配置**
    - 用户可配置全局映射规则，例如 `198.120` <-> `198.121`。
    - 支持第三段 (Subnet) 或第二段 (Net) 的自动偏移计算。

- [ ] **策略级 "Auto-B" 开关**
    - 在策略行增加 "Generate B-Side" 复选框。
    - 勾选后，系统自动基于 A 网 IP 计算出 B 网 IP，并加入到验证逻辑中。

- [ ] **交错输出 (Interleaved Export)**
    - 导出预览时，自动生成 B 网对应的策略行。
    - 强制 A/B 策略紧邻打印，便于人工审核：
      ```text
      Policy_App_A_Plane  tcp  8080  8080  198.120.50.10
      Policy_App_B_Plane  tcp  8080  8080  198.121.50.10  (Auto-generated)
      ```



## v1.2: 智能聚合与体验 (Smart Optimization)

- [ ] **端口智能合并**
    - 自动识别连续端口（如 80, 81, 82）并合并为 range (80-82)。
    - 减少配置行数。


