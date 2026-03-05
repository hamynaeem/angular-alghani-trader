-- SQL: Create stored procedure sp_GetCashbookHistory
-- Adjust table/column names if your schema differs. Run this in the `db_cement` database.
DELIMITER //
CREATE PROCEDURE sp_GetCashbookHistory(IN p_fromdate VARCHAR(20), IN p_todate VARCHAR(20))
BEGIN
  -- Convert incoming strings to DATE; caller passes 'YYYY-M-D' in current code.
  DECLARE d1 DATE;
  DECLARE d2 DATE;
  SET d1 = STR_TO_DATE(p_fromdate, '%Y-%c-%e');
  SET d2 = STR_TO_DATE(p_todate, '%Y-%c-%e');

  -- If your cash entries live in another table, update the table name below.
  SELECT `Date`, `Description`, `Debit`, `Credit`, `Balance`, `IsPosted`, `ID`
  FROM `cashbook`
  WHERE `Date` BETWEEN d1 AND d2
  ORDER BY `Date`;
END//
DELIMITER ;

-- To apply:
-- 1) Use the MySQL client or administration tool connected to the `db_cement` database.
-- 2) Run: SOURCE path/to/sp_GetCashbookHistory.sql
-- 3) Verify with: SHOW PROCEDURE STATUS WHERE Db = 'db_cement' AND Name = 'sp_GetCashbookHistory';
