#!/usr/bin/env bash
# scripts/build_encrypted_wheel.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=================================================="
echo "1. Installing encryption and build dependencies..."
echo "=================================================="
python3 -m pip install pyarmor build

CONSOLE_DIR="$REPO_ROOT/console"
CONSOLE_DEST="$REPO_ROOT/src/qwenpaw/console"

echo "=================================================="
echo "2. Building frontend Console..."
echo "=================================================="
if [ -d "$CONSOLE_DIR" ]; then
    (cd "$CONSOLE_DIR" && npm ci && npm run build)
    rm -rf "$CONSOLE_DEST"/*
    mkdir -p "$CONSOLE_DEST"
    cp -R "$CONSOLE_DIR/dist/"* "$CONSOLE_DEST/"
else
    echo "Warning: Console directory not found at $CONSOLE_DIR"
fi

BUILD_DIR="$REPO_ROOT/build_encrypted"
echo "=================================================="
echo "3. Preparing isolated build workspace ($BUILD_DIR)..."
echo "=================================================="
rm -rf "$BUILD_DIR" dist/*
mkdir -p "$BUILD_DIR"

cp -R src/ pyproject.toml README.md README_zh.md LICENSE "$BUILD_DIR/"

echo "=================================================="
echo "4. Encrypting Python code (Skills)..."
echo "=================================================="
cd "$BUILD_DIR"

# Encrypt the skills directory
pyarmor gen -O obf_dist -r src/qwenpaw/agents/skills/

# Copy the obfuscated code back over the original files in the build workspace
echo "Copying obfuscated files from obf_dist/skills/ to src/qwenpaw/agents/skills/"
cp -R obf_dist/skills/* src/qwenpaw/agents/skills/

mv obf_dist/pyarmor_runtime_* src/qwenpaw/ 2>/dev/null || true

echo "=================================================="
echo "5. Building the final Encrypted Wheel package..."
echo "=================================================="
python3 -m build --outdir "$REPO_ROOT/dist" .

echo "=================================================="
echo "Success! The encrypted Wheel is located in $REPO_ROOT/dist/"
echo "You can now run scripts/pack/build_macos.sh or build_win.ps1"
echo "=================================================="
