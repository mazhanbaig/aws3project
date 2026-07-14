#!/bin/bash

# ProjectFolio Video Recording Script
# Records terminal session and browser for CI/CD pipeline demo

set -e

echo "🎬 ProjectFolio Video Recording"
echo "================================"

# Configuration
RECORDING_DIR="recordings"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TERMINAL_CAST="${RECORDING_DIR}/terminal_${TIMESTAMP}.cast"
BROWSER_VIDEO="${RECORDING_DIR}/browser_${TIMESTAMP}.mp4"
OUTPUT_VIDEO="${RECORDING_DIR}/projectfolio_demo_${TIMESTAMP}.mp4"

# Create recordings directory
mkdir -p "$RECORDING_DIR"

# Check for required tools
check_tools() {
    local missing=()
    
    if ! command -v asciinema &> /dev/null; then
        missing+=("asciinema")
    fi
    
    if ! command -v ffmpeg &> /dev/null; then
        missing+=("ffmpeg")
    fi
    
    if ! command -v agg &> /dev/null; then
        missing+=("agg (asciinema agg)")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo "❌ Missing required tools:"
        for tool in "${missing[@]}"; do
            echo "   - $tool"
        done
        echo ""
        echo "Install with:"
        echo "  npm install -g asciinema agg"
        echo "  brew install ffmpeg (macOS) or apt install ffmpeg (Linux)"
        exit 1
    fi
}

# Record terminal session
record_terminal() {
    echo "📹 Starting terminal recording..."
    echo "Press Ctrl+D or type 'exit' to stop recording"
    echo ""
    
    # Start asciinema recording
    asciinema rec "$TERMINAL_CAST" -c "bash"
    
    echo ""
    echo "✅ Terminal recording saved to: $TERMINAL_CAST"
}

# Record browser with ffmpeg
record_browser() {
    local duration=${1:-30}  # Default 30 seconds
    
    echo "🌐 Starting browser recording for ${duration} seconds..."
    echo "Make sure the browser window is visible on screen"
    echo ""
    
    # Get screen dimensions (adjust for your display)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        SCREEN_SIZE=$(system_profiler SPDisplaysDataType | grep Resolution | awk '{print $2 "x" $4}')
    else
        # Linux
        SCREEN_SIZE=$(xrandr | grep '*' | awk '{print $1}' | head -1)
    fi
    
    # Record screen with ffmpeg
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - record specific window or full screen
        ffmpeg -f avfoundation -r 30 -i "1" -t "$duration" -c:v libx264 -preset fast -crf 23 "$BROWSER_VIDEO"
    else
        # Linux - record full screen
        ffmpeg -f x11grab -r 30 -video_size "$SCREEN_SIZE" -i :0.0 -t "$duration" -c:v libx264 -preset fast -crf 23 "$BROWSER_VIDEO"
    fi
    
    echo ""
    echo "✅ Browser recording saved to: $BROWSER_VIDEO"
}

# Combine recordings
combine_videos() {
    echo "🔄 Combining recordings..."
    
    # Convert terminal cast to video
    agg "$TERMINAL_CAST" "${RECORDING_DIR}/terminal_video.mp4"
    
    # Combine terminal and browser videos
    if [ -f "$BROWSER_VIDEO" ]; then
        # Create concat file
        echo "file '${RECORDING_DIR}/terminal_video.mp4'" > "${RECORDING_DIR}/concat.txt"
        echo "file '$BROWSER_VIDEO'" >> "${RECORDING_DIR}/concat.txt"
        
        # Concatenate videos
        ffmpeg -f concat -safe 0 -i "${RECORDING_DIR}/concat.txt" -c copy "$OUTPUT_VIDEO"
        
        echo "✅ Combined video saved to: $OUTPUT_VIDEO"
    else
        # Just use terminal video
        cp "${RECORDING_DIR}/terminal_video.mp4" "$OUTPUT_VIDEO"
        echo "✅ Terminal video saved to: $OUTPUT_VIDEO"
    fi
}

# Main recording flow
main() {
    check_tools
    
    echo ""
    echo "📋 Recording Plan:"
    echo "  1. Terminal recording (project overview, CI/CD pipeline, Terraform)"
    echo "  2. Browser recording (application demo)"
    echo "  3. Combine into final video"
    echo ""
    
    read -p "Start recording? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Record terminal
        record_terminal
        
        # Ask for browser recording
        read -p "Record browser behavior? (y/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Browser recording duration (seconds, default 30): " duration
            duration=${duration:-30}
            record_browser "$duration"
        fi
        
        # Combine videos
        combine_videos
        
        echo ""
        echo "🎉 Recording complete!"
        echo "Files saved in: $RECORDING_DIR/"
    else
        echo "Recording cancelled."
    fi
}

# Run main function
main
