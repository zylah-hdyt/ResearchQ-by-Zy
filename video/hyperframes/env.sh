# Local render environment for HyperFrames in this container (source before npx hyperframes ...)
HF_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
export HYPERFRAMES_FFMPEG_PATH="$HF_ROOT/node_modules/@ffmpeg-installer/linux-x64/ffmpeg"
export HYPERFRAMES_FFPROBE_PATH="$HF_ROOT/node_modules/@ffprobe-installer/linux-x64/ffprobe"
