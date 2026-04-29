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

## ✅ 仓库首次到手需要确认/改动的文件（必须）

为了保证“第一次拿到仓库就能打包成功”，请在开始前确认以下文件/改动已存在（本文档对应仓库内最终稳定版做法）：  

0. **为什么有两个加密脚本（.ps1 和 .sh）？应该用哪个？**  
   - 目标文件：  
     - Windows： [build_encrypted_wheel.ps1](file:///workspace/scripts/build_encrypted_wheel.ps1)  
     - Linux/macOS/WSL/Git Bash： [build_encrypted_wheel.sh](file:///workspace/scripts/build_encrypted_wheel.sh)  
   - 原因：同一套“加密 + 打 wheel”逻辑需要适配不同系统的 shell 环境。  
     - Windows 上直接用 bash 往往依赖 WSL/Git Bash；WSL 服务被禁用时会报 `Bash/0x80070422`，因此提供 `.ps1` 作为原生替代。  
     - Linux/macOS 上天然具备 bash，因此保留 `.sh` 版本便于在非 Windows 环境构建 wheel。  
   - 推荐：  
     - 只做 Windows 客户端：全流程使用 PowerShell 脚本（`.ps1`）  
     - 只做 Linux/macOS 包：使用 bash 脚本（`.sh`）  

1. **加密 Wheel 构建脚本（Windows 版）**  
   - 目标文件：[build_encrypted_wheel.ps1](file:///workspace/scripts/build_encrypted_wheel.ps1)  
   - 作用：构建前端 + 使用 PyArmor 加密 `src/qwenpaw/agents/tools/` + 生成加密 `.whl` 到 `dist/`  
   - 关键点：PyArmor 试用版会在部分场景触发限制，脚本中已排除 `browser_control.py`（该文件过大，试用版可能报 `out of license`）  

2. **打包器 build_common 在 Windows 需要绕过 conda run**  
   - 目标文件：[build_common.py](file:///workspace/scripts/pack/build_common.py)  
   - 原因：Windows 下 `conda run ... conda-pack ...` 可能静默失败并返回 exit code 1  
   - 处理：脚本在 Windows (`os.name == "nt"`) 下使用 `conda.bat activate <env> && conda-pack ...` 的方式执行打包  

3. **Windows 打包脚本必须跳过 conda-unpack**  
   - 目标文件：[build_win.ps1](file:///workspace/scripts/pack/build_win.ps1)  
   - 原因：`conda-unpack` 在 Windows 上可能破坏第三方库的 Python 字符串转义（典型：`huggingface_hub` 报 `SyntaxError: unterminated string literal`），甚至连 `pip` 都会受影响  
   - 处理：脚本已改为跳过 `conda-unpack`（我们的启动器使用相对路径启动 `python.exe`，不依赖 conda-unpack 修前缀）  

4. **NSIS 编译器 makensis 的查找方式（不依赖 PATH）**  
   - 目标文件：[build_win.ps1](file:///workspace/scripts/pack/build_win.ps1)  
   - 处理：脚本会优先从 PATH 查找 `makensis`，若找不到则尝试默认安装路径（如 `C:\\Program Files (x86)\\NSIS\\makensis.exe`）  

5. **包数据包含 tools 与 pyarmor 运行时**  
   - 目标文件：[pyproject.toml](file:///workspace/pyproject.toml#L57-L68)  
   - 必须包含：`agents/tools/**` 与 `pyarmor_runtime_000000` 的 package-data，否则 Wheel 安装后运行会报 `ModuleNotFoundError: pyarmor_runtime_000000`  

6. **Python 版本必须一致（解决 DLL load failed）**  
   - 目标文件：[build_win.ps1](file:///workspace/scripts/pack/build_win.ps1)  
   - 原因：PyArmor 加密时生成的 C 扩展库（`pyarmor_runtime_*.pyd`）与当前环境的 Python 版本强绑定（例如 Python 3.12）。如果打包时 `conda-pack` 创建的独立环境是 Python 3.10，客户端运行时就会报 `ImportError: DLL load failed while importing pyarmor_runtime`。  
   - 处理：在 `build_win.ps1` 中动态获取当前宿主环境的 Python 版本（如 `$PyVer`），并传递给 `build_common.py --python $PyVer`，确保加密和打包使用完全一致的 Python 版本。  

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
   - 将加密乱码文件和 PyArmor 运行依赖库（`pyarmor_runtime_000000`）放到 `src/` 下，作为顶层包随 wheel 一起安装（否则运行时报 `ModuleNotFoundError`）。
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
- **解决方案**：
  - 只加密核心目录（例如 `src/qwenpaw/agents/tools/`），不要全量加密 `src/qwenpaw/`  
  - 若仍报 `out of license`，通常是单文件过大或命中文件数限制：优先在加密脚本中排除超大文件（例如 `browser_control.py`）  
  - 若必须全量加密或加密超大文件：需要购买 PyArmor 授权或重构拆分大文件  

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
