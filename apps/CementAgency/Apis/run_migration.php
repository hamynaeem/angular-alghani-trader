<?php
// One-time migration script to add IsPosted column to transportdetails
// Usage (CLI): php run_migration.php

chdir(__DIR__);

// Load DB config
$cfg = __DIR__ . '/application/config/database.php';
if (!file_exists($cfg)) {
    echo "Cannot find database config at $cfg\n";
    exit(1);
}

// include returns nothing but defines $db variable
include $cfg;
if (!isset($db) || !isset($db['default'])) {
    echo "Invalid database config.\n";
    exit(1);
}

$conf = $db['default'];
$host = $conf['hostname'] ?? 'localhost';
$user = $conf['username'] ?? '';
$pass = $conf['password'] ?? '';
$name = $conf['database'] ?? '';

echo "Connecting to $host / database $name...\n";
$mysqli = new mysqli($host, $user, $pass, $name);
if ($mysqli->connect_errno) {
    echo "Connect failed: " . $mysqli->connect_error . "\n";
    exit(1);
}

// Check if table exists
$res = $mysqli->query("SHOW TABLES LIKE 'transportdetails'");
if (!$res || $res->num_rows === 0) {
    echo "Table 'transportdetails' not found in database $name.\n";
    exit(1);
}

// Check if column exists
$colq = $mysqli->prepare("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'transportdetails' AND COLUMN_NAME = 'IsPosted'");
$colq->bind_param('s', $name);
$colq->execute();
$colr = $colq->get_result()->fetch_assoc();
$colq->close();

if ($colr && intval($colr['cnt']) > 0) {
    echo "Column 'IsPosted' already exists on transportdetails.\n";
} else {
    echo "Adding column 'IsPosted' to transportdetails...\n";
    $alter = "ALTER TABLE `transportdetails` ADD COLUMN `IsPosted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Balance`";
    if (!$mysqli->query($alter)) {
        echo "ALTER failed: (" . $mysqli->errno . ") " . $mysqli->error . "\n";
        $mysqli->close();
        exit(1);
    }
    echo "Column added.\n";
}

// Ensure no nulls
echo "Normalizing NULL IsPosted values to 0...\n";
$mysqli->query("UPDATE `transportdetails` SET `IsPosted` = 0 WHERE `IsPosted` IS NULL");
if ($mysqli->errno) {
    echo "Update warning: (" . $mysqli->errno . ") " . $mysqli->error . "\n";
}

echo "Done. You can now retry posting/unposting in the application.\n";
$mysqli->close();

?>
