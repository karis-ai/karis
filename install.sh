#!/bin/bash

# Karis CLI Installer
# Usage: curl -fsSL https://karis.im/install.sh | bash
#        curl -fsSL https://raw.githubusercontent.com/karis-ai/karis/main/install.sh | bash

set -e

KARIS_VERSION="${KARIS_VERSION:-latest}"
INSTALL_DIR="${HOME}/.karis/bin"
KARIS_BIN="${INSTALL_DIR}/karis"
REPO="karis-ai/karis"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[Karis]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[Karis]${NC} $1"; }
log_error() { echo -e "${RED}[Karis]${NC} $1"; }
log_step() { echo -e "${BLUE}[Karis]${NC} $1"; }

# Detect OS & Arch
OS="$(uname -s)"
case "${OS}" in
    Linux*)  PLATFORM="linux" ;;
    Darwin*) PLATFORM="darwin" ;;
    *)       log_error "Unsupported platform: ${OS}"; exit 1 ;;
esac

ARCH="$(uname -m)"
case "${ARCH}" in
    x86_64)  ARCH="x64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *)       log_error "Unsupported architecture: ${ARCH}"; exit 1 ;;
esac

log_info "Installing Karis CLI v${KARIS_VERSION} for ${PLATFORM}/${ARCH}..."

# Check prerequisites
if ! command -v node &> /dev/null; then
    log_error "Node.js is required but not installed."
    log_error "Install from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js 18+ required, but found $(node -v)"
    exit 1
fi

# Create install directory
mkdir -p "${INSTALL_DIR}"

# Method 1: Build from source (recommended)
install_from_source() {
    log_step "Building from source..."

    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "git is required to install from source"
        return 1
    fi

    TEMP_DIR=$(mktemp -d)
    trap "rm -rf ${TEMP_DIR}" EXIT

    log_info "Cloning ${REPO}..."

    if [ "${KARIS_VERSION}" = "latest" ]; then
        git clone --depth 1 "https://github.com/${REPO}.git" "${TEMP_DIR}/karis"
    else
        git clone --depth 1 --branch "${KARIS_VERSION}" "https://github.com/${REPO}.git" "${TEMP_DIR}/karis"
    fi

    cd "${TEMP_DIR}/karis"

    log_info "Installing dependencies..."
    npm install

    log_info "Building CLI..."
    npm run build

    # Copy built files
    mkdir -p "${INSTALL_DIR}"
    cp -r cli/dist "${INSTALL_DIR}/dist"
    cp cli/bin/karis.js "${KARIS_BIN}"
    chmod +x "${KARIS_BIN}"

    log_info "Build complete!"
    return 0
}

# Method 2: Direct npm install (if package is published)
install_via_npm() {
    if command -v npm &> /dev/null; then
        log_step "Trying npm install..."
        if npm install -g karis 2>/dev/null; then
            log_info "Installed via npm"
            return 0
        fi
    fi
    return 1
}

# Try install methods in order
if install_from_source; then
    log_info "Karis CLI installed successfully!"
else
    log_error "Installation failed"
    exit 1
fi

# Add to PATH
add_to_path() {
    local shell_rc=""
    case "${SHELL}" in
        *zsh*) shell_rc="${HOME}/.zshrc" ;;
        *bash*) shell_rc="${HOME}/.bashrc" ;;
        *)     shell_rc="${HOME}/.profile" ;;
    esac

    if [ -f "${shell_rc}" ]; then
        if ! grep -qF "${INSTALL_DIR}" "${shell_rc}"; then
            echo "" >> "${shell_rc}"
            echo "# Karis CLI" >> "${shell_rc}"
            echo "export PATH=\"${INSTALL_DIR}:\${PATH}\"" >> "${shell_rc}"
            log_info "Added ${INSTALL_DIR} to PATH in ${shell_rc}"
            log_info "Run: source ${shell_rc}"
        fi
    fi
}

add_to_path

echo ""
log_info "Installation complete!"
echo ""
echo "  Next steps:"
echo "    1. Run: source ~/.zshrc  (or restart your terminal)"
echo "    2. Run: karis setup"
echo ""
echo "  Commands:"
echo "    karis setup              # First-time configuration"
echo "    karis chat               # Natural language interface"
echo "    karis brand init <name>  # Create brand profile"
echo "    karis doctor             # Verify environment"
echo ""
