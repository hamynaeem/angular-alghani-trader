#!/bin/bash

# Script to find and delete Zone.Identifier files
# Usage: ./cleanup_zone_identifiers.sh [directory] --mode [view|delete]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DIRECTORY="."
MODE="view"
NO_CONFIRM=false

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [DIRECTORY] --mode [view|delete] [OPTIONS]

Find and optionally delete *:Zone.Identifier files in a directory.

Arguments:
  DIRECTORY              Directory to search (default: current directory)

Options:
  --mode MODE           Operation mode: view or delete (default: view)
  --no-confirm          Skip confirmation prompt when deleting
  -h, --help            Show this help message

Examples:
  # View Zone.Identifier files in current directory
  $0 . --mode view

  # Delete Zone.Identifier files in a specific folder
  $0 /path/to/folder --mode delete

  # Delete without confirmation prompt
  $0 /path/to/folder --mode delete --no-confirm

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            MODE="$2"
            shift 2
            ;;
        --no-confirm)
            NO_CONFIRM=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        -*)
            echo -e "${RED}Error: Unknown option $1${NC}"
            show_usage
            exit 1
            ;;
        *)
            DIRECTORY="$1"
            shift
            ;;
    esac
done

# Validate mode
if [[ "$MODE" != "view" && "$MODE" != "delete" ]]; then
    echo -e "${RED}Error: Invalid mode '$MODE'. Use 'view' or 'delete'.${NC}"
    show_usage
    exit 1
fi

# Check if directory exists
if [ ! -d "$DIRECTORY" ]; then
    echo -e "${RED}Error: Directory '$DIRECTORY' does not exist.${NC}"
    exit 1
fi

# Get absolute path
ABS_DIR=$(cd "$DIRECTORY" && pwd)
echo -e "${BLUE}Scanning directory: $ABS_DIR${NC}"
echo

# Find all Zone.Identifier files
mapfile -t ZONE_FILES < <(find "$DIRECTORY" -type f -name "*:Zone.Identifier" 2>/dev/null)

# Count files
FILE_COUNT=${#ZONE_FILES[@]}

if [ $FILE_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ No Zone.Identifier files found.${NC}"
    exit 0
fi

# Function to format file size
format_size() {
    local size=$1
    if [ $size -lt 1024 ]; then
        echo "${size} B"
    elif [ $size -lt 1048576 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1024}") KB"
    elif [ $size -lt 1073741824 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1048576}") MB"
    else
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1073741824}") GB"
    fi
}

# VIEW mode
if [ "$MODE" = "view" ]; then
    echo "================================================================================"
    echo "Found $FILE_COUNT Zone.Identifier file(s):"
    echo "================================================================================"
    echo
    
    TOTAL_SIZE=0
    for i in "${!ZONE_FILES[@]}"; do
        file="${ZONE_FILES[$i]}"
        # Try both macOS and Linux stat commands
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        TOTAL_SIZE=$((TOTAL_SIZE + size))
        
        echo "$((i+1)). $file"
        echo "   Size: $(format_size $size)"
        echo
    done
    
    echo "================================================================================"
    echo "Total files: $FILE_COUNT"
    echo "Total size: $(format_size $TOTAL_SIZE)"
    echo "================================================================================"
    
# DELETE mode
elif [ "$MODE" = "delete" ]; then
    echo -e "${YELLOW}Found $FILE_COUNT Zone.Identifier file(s) to delete.${NC}"
    echo
    
    # Show files to be deleted
    for i in "${!ZONE_FILES[@]}"; do
        echo "$((i+1)). ${ZONE_FILES[$i]}"
    done
    echo
    
    # Confirmation unless --no-confirm is set
    if [ "$NO_CONFIRM" = false ]; then
        read -p "Are you sure you want to delete these files? (yes/no): " -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]es$|^[Yy]$ ]]; then
            echo "Deletion cancelled."
            exit 0
        fi
    fi
    
    # Delete files
    echo "Deleting files..."
    DELETED=0
    FAILED=0
    
    for file in "${ZONE_FILES[@]}"; do
        if rm -f "$file" 2>/dev/null; then
            echo -e "${GREEN}✓ Deleted: $file${NC}"
            ((DELETED++))
        else
            echo -e "${RED}✗ Failed to delete: $file${NC}"
            ((FAILED++))
        fi
    done
    
    echo
    echo "================================================================================"
    echo -e "${GREEN}Deletion complete!${NC}"
    echo "  Successfully deleted: $DELETED"
    [ $FAILED -gt 0 ] && echo -e "  ${RED}Failed to delete: $FAILED${NC}"
    echo "================================================================================"
fi