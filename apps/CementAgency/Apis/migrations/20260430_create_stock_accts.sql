-- Migration: create stock_accts table and backfill from existing bookings
CREATE TABLE IF NOT EXISTS `stock_accts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` INT DEFAULT NULL,
  `date` DATE DEFAULT NULL,
  `supplier_id` INT DEFAULT NULL,
  `product_id` INT DEFAULT NULL,
  `qty_tons` DECIMAL(12,3) DEFAULT 0,
  `bags` INT DEFAULT 0,
  `price` DECIMAL(14,2) DEFAULT 0,
  `carriage` DECIMAL(14,2) DEFAULT 0,
  `amount` DECIMAL(14,2) DEFAULT 0,
  `vehicle_no` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`booking_id`),
  INDEX (`product_id`),
  INDEX (`date`)
);

-- Backfill purchase booking details into stock_accts
INSERT INTO stock_accts (booking_id, date, supplier_id, product_id, qty_tons, bags, price, carriage, amount, vehicle_no, created_at)
SELECT b.BookingID, b.Date, b.SupplierID, bd.ProductID, bd.Qty, COALESCE(bd.Qty * bd.Packing, bd.Qty * 20) AS bags, bd.PPrice AS price, COALESCE(b.Carriage,0) AS carriage, bd.Qty * COALESCE(bd.PPrice,0) AS amount, b.VehicleNo, NOW()
FROM booking b
JOIN booking_details bd ON bd.BookingID = b.BookingID
WHERE bd.Type = 1;

-- Note: run this migration once in your DB environment (e.g., mysql < this_file.sql)
