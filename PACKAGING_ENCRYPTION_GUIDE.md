# QwenPaw 客户端加密与打包指南

## 🎯 核心目标
将项目（含前端、后端、动态技能包）打包为独立的 Windows 桌面客户端（`.exe`），并对核心 Python 源码（如 `skills` 目录）进行加密混淆，保护核心商业逻辑和知识产权。

## 🛠️ 涉及工具与技术栈
整个客户端生成链路涉及 4 个核心工具链的配合：

1. **PyArmor**：专业的 Python 脚本混淆与加密工具。负责将明文的 `.py` 文件转化为带有运行时校验的密文乱码。
2. **Python `build` 模块**：标准的 Python 包构建工具。负责将加密后的 Python 源码与非加密的静态资源（前端产物、`.md`、`.json` 等）合并，打成标准的 Python `.whl`（Wheel）安装包。
3. **Conda & conda-pack**：环境隔离与封包工具。`conda` 负责创建一个极其干净的虚拟环境并安装 `.whl`；`conda-pack` 负责把整个环境（包含 Python 解释器、系统依赖和你的加密代码）“冷冻”压缩为一个独立的便携运行环境（ZIP包）。
4. **NSIS (Nullsoft Scriptable Install System)**：Windows 平台开源的安装包制作工具。它通过读取 `desktop.nsi` 脚本，将冷冻好的环境压缩包与系统启动图标、快捷方式等结合，编译出最终用户可双击安装的 `.exe` 客户端。

---

## 🚀 完整操作流程

### 第一步：环境与依赖准备
1. 安装 Python 打包与加密的基础库：
   ```bash
   python3 -m pip install pyarmor build
   ```
2. 下载并安装 **NSIS** 编译器 (前往 [NSIS官网下载](https://nsis.sourceforge.io/Download))，安装后**必须将其安装目录（包含 `makensis.exe`）添加到系统环境变量 `Path` 中**。

### 第二步：执行加密并生成 Wheel 核心包
在终端（支持全平台，Windows 推荐使用 Git Bash 或 WSL，或者直接跑脚本）执行：
```bash
bash scripts/build_encrypted_wheel.sh
```
**底层工作原理：**
- 自动构建最新前端代码到 `console/dist`。
- 创建临时“无菌”工作区 `build_encrypted/`，拷贝项目源码，避免污染你的本地开发代码。
- 使用 `pyarmor gen` 命令针对 `src/qwenpaw/agents/skills/` 目录进行独立加密。
- 将生成的加密乱码以及 PyArmor 运行必须的依赖库（`pyarmor_runtime_xxxxxx`）覆盖回临时工作区。
- 调用 `python -m build`，最终在项目根目录下的 `dist/` 文件夹中生成带有加密代码的 `qwenpaw-xxx.whl` 文件。

### 第三步：封装为独立 Windows 客户端
在 Windows 系统的 **Anaconda Prompt** 中，进入项目根目录执行：
```powershell
powershell.exe -ExecutionPolicy Bypass -File .\scripts\pack\build_win.ps1
```
**底层工作原理：**
- 脚本检测到 `dist/` 目录下存在刚刚生成的 `.whl` 加密包，输出 `skipping`（跳过普通明文包的构建，直接使用加密包）。
- 调用 `scripts/pack/build_common.py`，创建一个临时的 Conda 环境（如 `qwenpaw_pack_xxxxx`）。
- 将加密的 `.whl` 安装到这个环境里。
- 抛弃不稳定的 `conda run`，直接激活该环境并调用 `conda-pack`，将环境压缩提取为 `dist/qwenpaw-env.zip`。
- 最终，调用 NSIS 的 `makensis.exe` 编译器，将 ZIP 环境与外壳组合，编译出最终产物：`dist/QwenPaw-Setup-1.1.4b1.exe`。

---

## ⚠️ 常见问题与避坑指南 (Troubleshooting)

### 1. PyArmor 免费版限制报错 (Out of License)
- **原因**：PyArmor 免费版单次加密的单个项目最多允许包含 100 个文件，而整个 QwenPaw 框架源码文件极多。
- **解决**：调整 `build_encrypted_wheel.sh` 里的加密路径，**仅针对核心商业逻辑文件夹（如 `skills` 目录）进行加密**，保持其他开源框架代码明文；若需全量加密，需购买 PyArmor 授权。

### 2. Windows 下 `conda-pack` 神秘失败退出 (Exit Code 1)
- **原因**：
  1. `conda run` 命令在 Windows 上执行重型 I/O 任务时经常出现 Bug，会截断日志并静默崩溃。
  2. Windows 默认长路径限制（超 260 字符），导致解压前端 node_modules 或大模型依赖时报错。
- **解决**：
  1. **开启长路径**：修改注册表 `LongPathsEnabled` 为 1 开启长路径支持并重启电脑。
  2. **替换执行方式**：修改 `build_common.py`，抛弃 `subprocess` 直接调用 `conda run`，改为原生 Shell 模拟执行：`conda activate <env> && conda-pack ...`。

### 3. NSIS 编译报错：找不到 makensis
- **报错信息**：`makensis not found in PATH`。
- **解决**：确认已安装 NSIS。如果已安装但仍报此错（Windows 环境变量未生效），可以在 `build_win.ps1` 的 300 行附近，直接**硬编码指定 `makensis.exe` 的绝对安装路径**（例如 `C:\Program Files (x86)\NSIS\makensis.exe`）。

### 4. Markdown (`.md`) 或配置文件可以被加密吗？
- **不能**。PyArmor 专门针对且只能加密 Python (`.py`) 脚本。非代码文件（如 `.md`、`.json`、`.yaml`）在最终打包时依然是明文。
- **解决**：如果你的 `.md` 中包含绝密 Prompt 不想被解包看到，**建议将其硬编码转化为 Python 字符串变量**（写在 `.py` 文件中）。这样在打包时，PyArmor 会将这些字符串连同逻辑代码一起混淆成乱码。
