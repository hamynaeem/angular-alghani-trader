-- Migration: add IsPosted column to transportdetails
-- Run this on your MySQL server connected to the same DB used by the API.

ALTER TABLE `transportdetails`
  ADD COLUMN IF NOT EXISTS `IsPosted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Balance`;

-- Ensure existing rows have a valid value (0 = unposted)
UPDATE `transportdetails` SET `IsPosted` = 0 WHERE `IsPosted` IS NULL;

-- Optional: verify the row
SELECT ID, Date, Details, Income, Expense, Balance, IsPosted FROM transportdetails LIMIT 10;
