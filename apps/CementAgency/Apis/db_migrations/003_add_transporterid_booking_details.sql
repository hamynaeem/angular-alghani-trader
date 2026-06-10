-- Migration: store the selected transporter on each booking sale detail.
-- This lets stock reduce from the transport selected for that row, not from
-- the booking header vehicle or whichever transport was selected last.

ALTER TABLE `booking_details`
  ADD COLUMN `TransporterID` varchar(100) NULL AFTER `CustomerID`;

UPDATE `booking_details` bd
JOIN `booking` b ON b.`BookingID` = bd.`BookingID`
SET bd.`TransporterID` = b.`VehicleNo`
WHERE bd.`Type` = 2
  AND (bd.`TransporterID` IS NULL OR bd.`TransporterID` = '');
