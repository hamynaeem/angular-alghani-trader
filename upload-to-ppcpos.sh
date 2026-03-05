#!/bin/bash

# Script to upload files from local computer to server via SSH
# Usage: ./upload-to-server.sh [source_subfolder] [destination_subfolder]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default configuration
SERVER_USER="u142573425"
SERVER_HOST="141.136.33.233"
SERVER_PORT="65002"
SERVER_PASS="Gujrat@123*"
SERVER="$SERVER_USER@$SERVER_HOST"
SOURCE_ROOT="$HOME/work-13/dist/apps"
DEST_ROOT="/home/u142573425/domains/ppcpos.com/public_html"

# Folders to exclude from upload (space-separated)
EXCLUDE_FOLDERS="backups backup backup_* node_modules .git assets"

# Check if arguments provided
if [ "$#" -eq 0 ]; then
    echo -e "${RED}Error: Invalid number of arguments${NC}"
    echo "Usage: $0 <source_subfolder> [destination_subfolder]"
    echo ""
    echo "Example: $0 SalesAndCreditManager"
    echo "Example: $0 SalesAndCreditManager myapp"
    echo ""
    echo "Defaults:"
    echo "  Server:      $SERVER (port $SERVER_PORT)"
    echo "  Source root: $SOURCE_ROOT"
    echo "  Dest root:   $DEST_ROOT"
    exit 1
fi

SOURCE_SUBFOLDER="$1"
DEST_SUBFOLDER="${2:-$SOURCE_SUBFOLDER}"

SOURCE_FOLDER="$SOURCE_ROOT/$SOURCE_SUBFOLDER"
DEST_FOLDER="$DEST_ROOT/$DEST_SUBFOLDER"

# Validate source folder exists
if [ ! -d "$SOURCE_FOLDER" ]; then
    echo -e "${RED}Error: Source folder '$SOURCE_FOLDER' does not exist${NC}"
    exit 1
fi

# Display summary
echo -e "${YELLOW}Upload Summary:${NC}"
echo "  Source:      $SOURCE_FOLDER"
echo "  Server:      $SERVER"
echo "  Destination: $DEST_FOLDER"
echo ""

# Confirm before proceeding
read -p "This will DELETE all files in $DEST_FOLDER on $SERVER and upload new files. Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Upload cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Step 1: Testing SSH connection...${NC}"

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}Note: sshpass not found. You may be prompted for password multiple times.${NC}"
    echo -e "${YELLOW}Install sshpass to avoid multiple prompts: sudo apt-get install sshpass${NC}"
    USE_SSHPASS=false
else
    USE_SSHPASS=true
fi

# Test SSH connection
if [ "$USE_SSHPASS" = true ]; then
    if ! sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SERVER" "echo 'Connection successful'" > /dev/null 2>&1; then
        echo -e "${RED}Error: Cannot connect to $SERVER on port $SERVER_PORT${NC}"
        echo "Please check your SSH credentials and network connection"
        exit 1
    fi
else
    if ! ssh -p "$SERVER_PORT" -o ConnectTimeout=5 "$SERVER" "echo 'Connection successful'" > /dev/null 2>&1; then
        echo -e "${RED}Error: Cannot connect to $SERVER on port $SERVER_PORT${NC}"
        echo "Please check your SSH credentials and network connection"
        exit 1
    fi
fi

echo -e "${GREEN}✓ SSH connection successful${NC}"
echo ""

echo -e "${GREEN}Step 2: Creating destination folder if it doesn't exist...${NC}"

# Create destination folder if it doesn't exist
if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $DEST_FOLDER"
else
    ssh -p "$SERVER_PORT" "$SERVER" "mkdir -p $DEST_FOLDER"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create destination folder${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Destination folder ready${NC}"
echo ""

echo -e "${GREEN}Step 3: Creating backup of existing files...${NC}"

# Create backup folder with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$DEST_FOLDER/backups"
BACKUP_FILE="backup_$TIMESTAMP.tar.gz"

# Create compressed backup of existing files (not folders)
if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "
      if [ -d '$DEST_FOLDER' ] && [ \"\$(find '$DEST_FOLDER' -maxdepth 1 -type f 2>/dev/null | wc -l)\" -gt 0 ]; then
        mkdir -p '$BACKUP_DIR'
        cd '$DEST_FOLDER' && tar -czf '$BACKUP_DIR/$BACKUP_FILE' --exclude='backups' \$(find . -maxdepth 1 -type f -printf '%P\n') 2>/dev/null
        if [ -f '$BACKUP_DIR/$BACKUP_FILE' ]; then
          echo 'Backup created and compressed'
          # Keep only last 5 backups
          cd '$BACKUP_DIR' && ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --
          BACKUP_COUNT=\$(ls -1 backup_*.tar.gz 2>/dev/null | wc -l)
          BACKUP_SIZE=\$(du -h '$BACKUP_FILE' | cut -f1)
          echo \"Backup size: \$BACKUP_SIZE\"
          echo \"Total backups: \$BACKUP_COUNT\"
        else
          echo 'Failed to create backup'
        fi
      else
        echo 'No files to backup'
      fi
    "
else
    ssh -p "$SERVER_PORT" "$SERVER" "
      if [ -d '$DEST_FOLDER' ] && [ \"\$(find '$DEST_FOLDER' -maxdepth 1 -type f 2>/dev/null | wc -l)\" -gt 0 ]; then
        mkdir -p '$BACKUP_DIR'
        cd '$DEST_FOLDER' && tar -czf '$BACKUP_DIR/$BACKUP_FILE' --exclude='backups' \$(find . -maxdepth 1 -type f -printf '%P\n') 2>/dev/null
        if [ -f '$BACKUP_DIR/$BACKUP_FILE' ]; then
          echo 'Backup created and compressed'
          # Keep only last 5 backups
          cd '$BACKUP_DIR' && ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --
          BACKUP_COUNT=\$(ls -1 backup_*.tar.gz 2>/dev/null | wc -l)
          BACKUP_SIZE=\$(du -h '$BACKUP_FILE' | cut -f1)
          echo \"Backup size: \$BACKUP_SIZE\"
          echo \"Total backups: \$BACKUP_COUNT\"
        else
          echo 'Failed to create backup'
        fi
      else
        echo 'No files to backup'
      fi
    "
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create backup${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
echo ""

echo -e "${GREEN}Step 4: Clearing existing files in destination folder...${NC}"

# Clear only files in destination folder, not subdirectories
if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "find '$DEST_FOLDER' -maxdepth 1 -type f -delete"
else
    ssh -p "$SERVER_PORT" "$SERVER" "find '$DEST_FOLDER' -maxdepth 1 -type f -delete"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to clear destination files${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Destination files cleared (folders preserved)${NC}"
echo ""

echo -e "${GREEN}Step 5: Creating temporary upload folder...${NC}"

# Create temporary folder for upload
TEMP_UPLOAD_DIR="$DEST_FOLDER/.temp_upload_$TIMESTAMP"

if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $TEMP_UPLOAD_DIR"
else
    ssh -p "$SERVER_PORT" "$SERVER" "mkdir -p $TEMP_UPLOAD_DIR"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create temporary upload folder${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Temporary folder created: $TEMP_UPLOAD_DIR${NC}"
echo ""

echo -e "${GREEN}Step 6: Uploading files with progress tracking...${NC}"

# Build exclude arguments for rsync
EXCLUDE_ARGS=""
for folder in $EXCLUDE_FOLDERS; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude='$folder'"
done

# Count total files to upload
TOTAL_FILES=$(find "$SOURCE_FOLDER" -type f | wc -l)
echo -e "${YELLOW}Total files to upload: $TOTAL_FILES${NC}"
echo ""

# Upload files using rsync (more efficient) or scp as fallback
if command -v rsync &> /dev/null; then
    # Use rsync with detailed progress and exclusions
    if command -v sshpass &> /dev/null; then
        eval "sshpass -p '$SERVER_PASS' rsync -avz --info=progress2 --info=name0 $EXCLUDE_ARGS -e 'ssh -p $SERVER_PORT -o StrictHostKeyChecking=no' '$SOURCE_FOLDER/' '$SERVER:$TEMP_UPLOAD_DIR/'"
    else
        eval "rsync -avz --info=progress2 --info=name0 $EXCLUDE_ARGS -e 'ssh -p $SERVER_PORT' '$SOURCE_FOLDER/' '$SERVER:$TEMP_UPLOAD_DIR/'"
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: File upload failed${NC}"
        echo -e "${YELLOW}Cleaning up temporary folder...${NC}"
        if [ "$USE_SSHPASS" = true ]; then
            sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "rm -rf $TEMP_UPLOAD_DIR"
        else
            ssh -p "$SERVER_PORT" "$SERVER" "rm -rf $TEMP_UPLOAD_DIR"
        fi
        exit 1
    fi
else
    echo -e "${YELLOW}Warning: rsync not found, using scp (folder exclusions not supported)${NC}"
    # Fallback to scp with progress
    if command -v sshpass &> /dev/null; then
        sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" -o StrictHostKeyChecking=no -r "$SOURCE_FOLDER/"* "$SERVER:$TEMP_UPLOAD_DIR/"
    else
        scp -P "$SERVER_PORT" -r "$SOURCE_FOLDER/"* "$SERVER:$TEMP_UPLOAD_DIR/"
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: File upload failed${NC}"
        echo -e "${YELLOW}Cleaning up temporary folder...${NC}"
        if [ "$USE_SSHPASS" = true ]; then
            sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "rm -rf $TEMP_UPLOAD_DIR"
        else
            ssh -p "$SERVER_PORT" "$SERVER" "rm -rf $TEMP_UPLOAD_DIR"
        fi
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✓ Upload to temporary folder completed!${NC}"
echo ""

echo -e "${GREEN}Step 7: Moving files from temporary to final destination...${NC}"

# Move files from temporary folder to destination
if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "
      cd $TEMP_UPLOAD_DIR && 
      find . -mindepth 1 -maxdepth 1 -exec mv -f {} $DEST_FOLDER/ \; &&
      cd .. &&
      rmdir $TEMP_UPLOAD_DIR
    "
else
    ssh -p "$SERVER_PORT" "$SERVER" "
      cd $TEMP_UPLOAD_DIR && 
      find . -mindepth 1 -maxdepth 1 -exec mv -f {} $DEST_FOLDER/ \; &&
      cd .. &&
      rmdir $TEMP_UPLOAD_DIR
    "
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to move files to final destination${NC}"
    echo -e "${YELLOW}Files remain in temporary folder: $TEMP_UPLOAD_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Files moved to final destination${NC}"

echo ""
echo -e "${GREEN}✓ Upload completed successfully!${NC}"
echo ""

# Show summary of uploaded files
echo -e "${YELLOW}Verifying upload...${NC}"
if [ "$USE_SSHPASS" = true ]; then
    FILE_COUNT=$(sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER" "find $DEST_FOLDER -type f | wc -l")
else
    FILE_COUNT=$(ssh -p "$SERVER_PORT" "$SERVER" "find $DEST_FOLDER -type f | wc -l")
fi
echo -e "${GREEN}Total files uploaded: $FILE_COUNT${NC}"
