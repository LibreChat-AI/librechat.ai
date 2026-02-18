#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[fresh-build]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
fail() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

SKIP_BUILD=false
DEV_MODE=false

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --dev)        DEV_MODE=true ;;
    --help|-h)
      echo "Usage: ./scripts/fresh-build.sh [OPTIONS]"
      echo ""
      echo "Wipes all build artifacts and caches, reinstalls dependencies,"
      echo "then builds and serves the site locally."
      echo ""
      echo "Options:"
      echo "  --dev          Run dev server instead of production build"
      echo "  --skip-build   Only clean + install, don't build or start"
      echo "  -h, --help     Show this help message"
      exit 0
      ;;
    *)
      warn "Unknown option: $arg (ignored)"
      ;;
  esac
done

check_node_version() {
  local required="18.18"
  local current
  current="$(node -v 2>/dev/null | sed 's/^v//')" || fail "Node.js is not installed"
  local req_major req_minor cur_major cur_minor
  req_major="${required%%.*}"
  req_minor="${required#*.}"
  cur_major="${current%%.*}"
  cur_minor="${current#*.}"
  cur_minor="${cur_minor%%.*}"

  if (( cur_major < req_major )) || { (( cur_major == req_major )) && (( cur_minor < req_minor )); }; then
    fail "Node.js >= v${required} required (found v${current}). Check .nvmrc"
  fi
  ok "Node.js v${current}"
}

check_pnpm() {
  command -v pnpm &>/dev/null || fail "pnpm is not installed (npm i -g pnpm)"
  ok "pnpm $(pnpm -v)"
}

clean_artifacts() {
  log "Removing build artifacts and caches..."
  rm -rf .next .source node_modules/.cache
  ok "Cleaned .next, .source, node_modules/.cache"
}

clean_deps() {
  if [[ -d node_modules ]]; then
    log "Removing node_modules..."
    rm -rf node_modules
    ok "Cleaned node_modules"
  fi
}

setup_env() {
  if [[ ! -f .env ]]; then
    if [[ -f .env.template ]]; then
      cp .env.template .env
      warn "Created .env from .env.template (all values empty — site will work without them)"
    else
      touch .env
      warn "Created empty .env"
    fi
  else
    ok ".env already exists"
  fi
}

install_deps() {
  log "Installing dependencies..."
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
  ok "Dependencies installed"
}

build_site() {
  log "Building production site..."
  pnpm build
  ok "Production build complete"
}

start_site() {
  log "Starting production server on http://localhost:3333 ..."
  echo ""
  pnpm start
}

start_dev() {
  log "Starting dev server on http://localhost:3333 ..."
  echo ""
  pnpm dev
}

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  librechat.ai — fresh build${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_node_version
check_pnpm

clean_artifacts
clean_deps
setup_env
install_deps

if $SKIP_BUILD; then
  ok "Clean install done (build skipped)"
  exit 0
fi

if $DEV_MODE; then
  start_dev
else
  build_site
  start_site
fi
