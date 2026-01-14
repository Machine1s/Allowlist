# Allowlist Generator

A powerful, React-based tool for generating, validating, and managing network whitelist configurations.

## 🚀 Key Features

*   **Intelligent IP Splitting**: Automatically splits large IP ranges (CIDR) into manageable chunks (max 20 IPs per line).
*   **Strict Validation**: 
    *   Validates IPv4 formats strictly.
    *   **Auto-excludes** Network (`.0`) and Broadcast (`.255`) addresses from ranges.
    *   Detects duplicate IPs across different policies.
*   **Smart Parsing**: Supports importing existing `.txt` configuration files.
*   **Visual Management**: 
    *   Easy-to-use table interface for managing complex policies.
    *   Batch operations (Duplicate, Delete).
    *   Real-time validation feedback.
*   **Output Preview**: Generate the final configuration text with one click.

## 🛠 Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS (v4)
*   **Icons**: Lucide React
*   **Testing**: Vitest, React Testing Library

## 📦 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/allowlist-generator.git
    cd allowlist-generator
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

## 🧪 Running Tests

This project includes a comprehensive test suite covering unit logic (IP calculations) and integration flows (User Validations).

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui
```

## 📝 Configuration File Format

The tool supports importing/exporting text files with the following format:

```text
Description Protocol start_port end_port IP
Description Protocol start_port end_port StartIP-EndIP
```

Example:
```text
MyWebServer tcp 80 80 192.168.1.100
DB_Cluster tcp 3306 3306 10.0.0.1-10.0.0.20
```

## 📄 License

MIT

## 🤖 AI Collaboration

This project is a result of **Human-AI Pair Programming**. 

Core logic implementation, comprehensive testing, and documentation were co-authored by the developer and **Antigravity** (Google DeepMind's Advanced Agentic Coding Assistant).
