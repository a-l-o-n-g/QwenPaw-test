# QwenPaw 客户端加密与独立打包指南 (最终版)

本文档详细记录了如何将本工程打包成带有独立环境的 Windows 客户端（`.exe`），并对核心 Python 代码（如业务工具包 `tools`）进行不可逆加密，以保护核心商业逻辑和知识产权。
按照本文档操作，任何人都可以零门槛复现并获得最终加密客户端。

---

## 🎯 核心原理与工具链
整个客户端生成链路是一条精密的流水线，涉及 4 个核心工具链的配合：

1. **PyArmor**：专业的 Python 脚本加密工具。负责将明文 `.py` 文件转化为带有防逆向机制的乱码。
2. **Python `build` 模块**：标准的包构建工具。将加密后的代码与前端产物（Console）合并为 Python 标准 `.whl` (Wheel) 包。
3. **Conda & conda-pack**：环境隔离工具。`conda` 负责创建一个极其干净的环境并安装上述 `.whl`；`conda-pack` 负责把整个环境（包含解释器和依赖）“冷冻”压缩为便携的运行环境包。
4. **NSIS (Nullsoft Scriptable Install System)**：Windows 平台的 `.exe` 安装程序编译器。它通过读取配置文件，将冷冻环境与安装界面、桌面快捷方式结合，编译出最终安装包。

---

## 🛠️ 第一步：环境与依赖准备

在开始打包之前，请确保你的打包电脑（推荐 Windows 环境）满足以下条件：

1. **安装打包依赖**：
   在 Anaconda Prompt 或终端中执行：
   ```bash
   python3 -m pip install pyarmor build
   ```

2. **安装并配置 NSIS 编译器**：
   - 前往 [NSIS 官网](https://nsis.sourceforge.io/Download) 下载最新版安装包。
   - 双击默认安装（记住安装路径，通常为 `C:\Program Files (x86)\NSIS`）。
   - **核心步骤**：必须将 NSIS 安装目录添加到系统环境变量 `Path` 中（或直接参考后文的硬编码避坑方案）。

---

## 🚀 第二步：加密代码并生成 Wheel 核心包

这一步的目的是保护我们的核心资产，并将其标准化封装。

1. **执行构建脚本**：
   在 **Anaconda Prompt** 或 PowerShell 中执行以下命令：
   ```powershell
   powershell.exe -ExecutionPolicy Bypass -File .\scripts\build_encrypted_wheel.ps1
   ```

2. **工作原理解析**：
   - 脚本会首先自动进入 `console/` 构建最新的前端界面。
   - 在项目根目录创建一个临时“无菌”工作区 `build_encrypted/`，复制源码，防止污染你本地的明文开发代码。
   - 针对 `src/qwenpaw/agents/tools/` 目录调用 PyArmor 进行混淆加密。
   - 将加密乱码文件和 PyArmor 运行依赖库（`pyarmor_runtime_xxxxxx`）覆盖回临时工作区。
   - 最终在项目根目录的 `dist/` 文件夹下生成带有加密代码的安装包：`qwenpaw-xxx.whl`。

---

## 📦 第三步：封装为独立 Windows 客户端 (.exe)

这一步是将加密包塞进一个随开随用的 Windows 程序中。

1. **执行平台封包脚本**：
   在 **Anaconda Prompt** 中，进入项目根目录并执行：
   ```powershell
   powershell.exe -ExecutionPolicy Bypass -File .\scripts\pack\build_win.ps1
   ```

2. **工作原理解析**：
   - 脚本检测到 `dist/` 下已存在刚才生成的加密 `.whl` 包，输出 `skipping`（跳过普通包构建）。
   - 脚本通过 `scripts/pack/build_common.py` 创建一个独立的临时 Conda 环境，并将加密包和所有依赖安装进去。
   - **环境冷冻**：激活该环境，调用 `conda-pack`，将整个环境压缩提取为 `dist/qwenpaw-env.zip`。
   - **界面封装**：脚本解压环境，并在底层调用 NSIS（`makensis.exe`）将环境与安装界面打包在一起。
   - 最终产出：`dist/QwenPaw-Setup-1.1.4b1.exe`（将此文件发给用户即可双击安装使用）。

---

## ⚠️ 常见问题与避坑指南 (Troubleshooting)

在打包过程中，你可能会遇到以下典型深坑，这里提供了最成熟的终极解决方案：

### 1. PyArmor 提示 "Out of License"（超出免费版文件限制）
- **现象**：在第二步执行加密脚本时中断报错。
- **原因**：PyArmor 免费版单次加密的单个项目最多允许包含 100 个文件，而 QwenPaw 框架全量源码文件极多。
- **解决方案**：在 `build_encrypted_wheel.sh` 中，**仅指定核心商业逻辑文件夹进行加密**（如 `pyarmor gen -r src/qwenpaw/agents/tools/`）。这样既保护了最核心的提示词和逻辑，又避开了免费版限制。若需全量加密，请购买 PyArmor 授权。

### 2. Windows 下 `conda-pack` 神秘静默失败 (Exit Code 1)
- **现象**：执行第三步时，抛出 `CalledProcessError`，提示 `conda run conda-pack ... returned non-zero exit status 1`，且无具体错误原因。
- **原因**：Windows 下的 `conda run` 命令在执行长时间重型 I/O 任务时有底层 Bug，会吞噬报错日志并强行中断。
- **解决方案（彻底抛弃 `conda run`）**：
  修改 `scripts/pack/build_common.py` 的最后部分（220 行附近），改用 Windows 原生的 cmd 模拟手动激活：
  ```python
  # 抛弃 conda run，拼接原生命令
  pack_args = ["conda-pack", "-n", env_name, "-o", str(out_path), "-f", "--ignore-editable-packages", "--ignore-missing-files"]
  cmd_str = f"conda activate {env_name} && " + " ".join(pack_args)
  # 使用原生 shell 执行
  subprocess.run(cmd_str, cwd=REPO_ROOT, env=os.environ.copy(), shell=True)
  ```

### 3. `huggingface_hub` 报 `SyntaxError: unterminated string literal`
- **现象**：环境封包后，解压并验证（Verifying fix）时，提示某些第三方库（如 `huggingface_hub`）的 Python 脚本存在语法错误。
- **原因**：这是 `conda-unpack` 的一个灾难级 Bug（Issue #154）。它在 Windows 下重写环境变量路径前缀时，采用了粗暴的字节替换，导致原本合法的 Python 转义字符（如 `\\?\`）被破坏，甚至连修复用的 `pip` 核心组件都会瘫痪。
- **解决方案（釜底抽薪，跳过破坏步骤）**：
  因为我们的客户端启动脚本使用的是纯相对路径（`"%~dp0python.exe"`），是真正的绿色便携版，**根本不需要运行 `conda-unpack`！**
  打开 `scripts/pack/build_win.ps1`，找到并删除所有关于执行 `conda-unpack` 及错误恢复的代码块（大约 90 行），直接替换为：
  ```powershell
  # 彻底删除 conda-unpack 执行逻辑
  Write-Host "[build_win] Skipping conda-unpack to prevent Python string escaping corruption on Windows."
  ```
  *(注：切勿在 `.ps1` 脚本中写中文，否则会导致 PowerShell GBK/UTF-8 解析失败，抛出“数组索引表达式丢失”的报错)*

### 4. 找不到 `makensis` 编译器
- **现象**：最后一步提示 `makensis not found in PATH`。
- **原因**：NSIS 未安装，或安装后 Windows 环境变量未生效。
- **解决方案（暴力硬编码）**：
  打开 `build_win.ps1` 底部（304 行左右），抛弃不可靠的系统 PATH，直接硬编码默认安装路径：
  ```powershell
  $makensisPath = ""
  try { $makensisPath = (Get-Command makensis -ErrorAction Stop).Source } catch {
    $possiblePaths = @("C:\Program Files (x86)\NSIS\makensis.exe", "D:\Program Files (x86)\NSIS\makensis.exe")
    foreach ($p in $possiblePaths) { if (Test-Path $p) { $makensisPath = $p; break } }
  }
  if (-not $makensisPath) { throw "彻底找不到 makensis.exe！" }
  # 后续使用 $makensisPath 执行编译
  ```

### 5. Markdown (`.md`) 或配置文件没有被加密？
- **现象**：解压生成的客户端，发现 `tools/` 下的 Python 文件乱码了，但 `.md` 和 `.json` 依然是明文。
- **原因**：PyArmor 仅支持加密 Python 代码（`.py`）。
- **进阶解决方案**：如果你的 `.md` 中包含极高价值的 Prompt，请不要将其存为独立文件，而是将其**硬编码为 Python `.py` 文件中的字符串变量**。这样 PyArmor 就能将其连同算法逻辑一起混淆加密。
