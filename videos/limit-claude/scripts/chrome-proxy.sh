#!/bin/bash
# Launches the pre-installed Chromium through this environment's HTTPS proxy so remote
# assets (Unsplash/Pexels/CDN URLs) resolve during rendering. Remotion passes
# --no-proxy-server by default; those flags are replaced here.
PROXY="${HTTPS_PROXY:-${https_proxy:-}}"
ARGS=()
for a in "$@"; do
  case "$a" in
    --no-proxy-server|--proxy-server=*|--proxy-bypass-list=*) [ -z "$PROXY" ] && ARGS+=("$a") ;;
    *) ARGS+=("$a") ;;
  esac
done
[ -n "$PROXY" ] && ARGS+=("--proxy-server=$PROXY" "--proxy-bypass-list=localhost;127.0.0.1;::1")
exec /opt/pw-browsers/chromium-1243/chrome-linux64/chrome "${ARGS[@]}"
