-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 13, 2025 at 06:43 AM
-- Server version: 5.7.32
-- PHP Version: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_cement`
--

-- --------------------------------------------------------

--
-- Table structure for table `accttypes`
--

DROP TABLE IF EXISTS `accttypes`;
CREATE TABLE `accttypes` (
  `AcctTypeID` int(11) NOT NULL,
  `AcctType` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `BusinessID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
CREATE TABLE `booking` (
  `BookingID` int(11) NOT NULL,
  `InvoiceNo` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `SupplierID` int(11) DEFAULT '0',
  `InvoiceDate` datetime DEFAULT NULL,
  `Date` datetime DEFAULT NULL,
  `VehicleNo` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `CofNo` int(11) DEFAULT NULL,
  `BuiltyNo` int(11) DEFAULT NULL,
  `ReceiptNo` int(11) DEFAULT NULL,
  `Amount` double DEFAULT '0',
  `Discount` double DEFAULT '0',
  `Carriage` double NOT NULL DEFAULT '0',
  `NetAmount` double DEFAULT '0',
  `DtCr` varchar(5) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `Remarks` longtext CHARACTER SET utf8 COLLATE utf8_bin,
  `IsPosted` int(3) DEFAULT '0',
  `ClosingID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `booking_details`
--

DROP TABLE IF EXISTS `booking_details`;
CREATE TABLE `booking_details` (
  `DetailID` int(11) NOT NULL,
  `BookingID` int(11) DEFAULT '0',
  `ProductID` int(11) DEFAULT '0',
  `Qty` int(11) DEFAULT '0',
  `Bonus` int(11) DEFAULT '0',
  `PPrice` double DEFAULT '0',
  `SPrice` double DEFAULT '0',
  `DiscRatio` double DEFAULT '0',
  `ProfitRatio` double DEFAULT '0',
  `Discount` double DEFAULT '0',
  `MRP` double DEFAULT '0',
  `TaxRatio` double DEFAULT '0',
  `Received` double DEFAULT '0',
  `CustomerID` int(11) DEFAULT '0',
  `Packing` int(11) NOT NULL,
  `Type` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `business`
--

DROP TABLE IF EXISTS `business`;
CREATE TABLE `business` (
  `BusinessID` int(10) NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BusinessName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Address` mediumtext COLLATE utf8mb4_unicode_ci,
  `Phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `WhatsAppNo` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `City` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BackupCode` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Lic_No` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ExpiryDate` date DEFAULT NULL,
  `RenewalFees` decimal(10,0) DEFAULT NULL,
  `Notes` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB AVG_ROW_LENGTH=8192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `cashbook`
--

DROP TABLE IF EXISTS `cashbook`;
CREATE TABLE `cashbook` (
  `CashID` int(11) NOT NULL,
  `Date` datetime DEFAULT NULL,
  `AcctID` int(11) DEFAULT '0',
  `Details` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `Recvd` double DEFAULT '0',
  `Paid` double DEFAULT '0',
  `Balance` double DEFAULT '0',
  `Type` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `cashtypes`
--

DROP TABLE IF EXISTS `cashtypes`;
CREATE TABLE `cashtypes` (
  `TypeID` int(11) NOT NULL DEFAULT '0',
  `Description` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `CatID` int(11) NOT NULL,
  `CatName` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `CatCode` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
CREATE TABLE `cities` (
  `CityID` int(11) NOT NULL,
  `Cityname` varchar(255) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `closing`
--

DROP TABLE IF EXISTS `closing`;
CREATE TABLE `closing` (
  `ClosingID` int(10) NOT NULL,
  `Date` date DEFAULT NULL,
  `OpeningAmount` double(15,0) DEFAULT NULL,
  `ClosingAmount` double(15,0) DEFAULT NULL,
  `Status` int(10) DEFAULT NULL,
  `BusinessID` int(10) DEFAULT NULL
) ENGINE=InnoDB AVG_ROW_LENGTH=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `comdetails`
--

DROP TABLE IF EXISTS `comdetails`;
CREATE TABLE `comdetails` (
  `ID` int(11) NOT NULL,
  `SupplierID` int(11) DEFAULT NULL,
  `Date` datetime DEFAULT NULL,
  `Description` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Qty` double DEFAULT NULL,
  `ComRate` double DEFAULT NULL,
  `Amount` double DEFAULT NULL,
  `Status` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `customeraccts`
--

DROP TABLE IF EXISTS `customeraccts`;
CREATE TABLE `customeraccts` (
  `CustomerAcctID` int(11) NOT NULL,
  `CustomerID` int(11) DEFAULT '0',
  `InvoiceID` int(11) DEFAULT '0',
  `Date` datetime DEFAULT NULL,
  `InvNo` int(11) DEFAULT '0',
  `RecNo` int(11) DEFAULT '0',
  `CofNo` int(11) DEFAULT '0',
  `BuiltyNo` int(11) DEFAULT '0',
  `VehicleNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Rate` double DEFAULT '0',
  `Description` longtext COLLATE utf8_bin,
  `Amount` decimal(18,5) DEFAULT '0.00000',
  `Recived` decimal(18,5) DEFAULT '0.00000',
  `Balance` decimal(18,5) DEFAULT '0.00000',
  `QtyIn` int(11) DEFAULT '0',
  `QtyOut` int(11) DEFAULT '0',
  `QtyBal` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `CustomerID` int(11) NOT NULL,
  `AcctTypeID` int(11) DEFAULT '0',
  `CustomerName` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Address` varchar(250) COLLATE utf8_bin DEFAULT NULL,
  `City` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `PhoneNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Balance` decimal(18,2) DEFAULT '0.00',
  `Salary` decimal(18,2) DEFAULT '0.00',
  `Status` smallint(6) DEFAULT '0',
  `Commission` decimal(18,0) DEFAULT NULL,
  `BalQty` double NOT NULL DEFAULT '0',
  `NTNNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `TaxActive` int(11) DEFAULT NULL,
  `CNICNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Limit` decimal(18,0) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `desigs`
--

DROP TABLE IF EXISTS `desigs`;
CREATE TABLE `desigs` (
  `DesigID` int(11) NOT NULL,
  `DesigName` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `expend`
--

DROP TABLE IF EXISTS `expend`;
CREATE TABLE `expend` (
  `ExpedID` int(11) NOT NULL,
  `Date` datetime DEFAULT NULL,
  `Desc` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `headid` int(11) DEFAULT '0',
  `Amount` double DEFAULT '0',
  `upsize_ts` tinyblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `expenseheads`
--

DROP TABLE IF EXISTS `expenseheads`;
CREATE TABLE `expenseheads` (
  `HeadID` int(11) NOT NULL,
  `Head` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `invoicedetails`
--

DROP TABLE IF EXISTS `invoicedetails`;
CREATE TABLE `invoicedetails` (
  `InvoiceDetailID` int(11) NOT NULL,
  `InvoiceID` int(11) DEFAULT NULL,
  `ProductID` int(11) DEFAULT NULL,
  `Qty` double DEFAULT '0',
  `Discount` decimal(10,2) DEFAULT '0.00',
  `SPRice` decimal(10,2) DEFAULT '0.00',
  `PPRice` decimal(10,2) DEFAULT '0.00',
  `MRPrice` decimal(10,2) DEFAULT '0.00',
  `TaxRatio` decimal(10,2) DEFAULT '0.00',
  `CustomerID` int(11) DEFAULT NULL,
  `Received` decimal(10,2) DEFAULT '0.00',
  `Date` datetime DEFAULT NULL,
  `PInvoiceID` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `InvoiceID` int(11) NOT NULL,
  `CustomerID` int(11) DEFAULT '0',
  `Date` datetime DEFAULT NULL,
  `CustomerName` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `VehicleNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Amount` double DEFAULT '0',
  `Discount` double DEFAULT '0',
  `Tax` double DEFAULT '0',
  `NetAmount` double DEFAULT '0',
  `AmntRecvd` double DEFAULT '0',
  `DtCr` varchar(5) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `modific`
--

DROP TABLE IF EXISTS `modific`;
CREATE TABLE `modific` (
  `ModID` int(11) NOT NULL,
  `Date` datetime DEFAULT NULL,
  `Time` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `STockID` double DEFAULT '0',
  `OldPrice` double DEFAULT '0',
  `OldQty` double DEFAULT '0',
  `NewPrice` double DEFAULT '0',
  `NewQty` double DEFAULT '0',
  `upsize_ts` tinyblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `pinvoicedetails`
--

DROP TABLE IF EXISTS `pinvoicedetails`;
CREATE TABLE `pinvoicedetails` (
  `DetailID` int(11) NOT NULL,
  `InvoiceID` int(11) DEFAULT '0',
  `ProductID` int(11) DEFAULT '0',
  `Qty` int(11) DEFAULT '0',
  `Bonus` int(11) DEFAULT '0',
  `PPrice` double DEFAULT '0',
  `SPrice` double DEFAULT '0',
  `DiscRatio` double DEFAULT '0',
  `ProfitRatio` double DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `pinvoices`
--

DROP TABLE IF EXISTS `pinvoices`;
CREATE TABLE `pinvoices` (
  `InvoiceID` int(11) NOT NULL,
  `InvoiceNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `SupplierID` int(11) DEFAULT '0',
  `InvoiceDate` datetime DEFAULT NULL,
  `Date` datetime DEFAULT NULL,
  `VehicleNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `CofNo` int(11) DEFAULT NULL,
  `BuiltyNo` int(11) DEFAULT NULL,
  `RecNo` int(11) DEFAULT NULL,
  `Amount` double DEFAULT '0',
  `Discount` double DEFAULT '0',
  `Carriage` double NOT NULL DEFAULT '0',
  `NetAmount` double DEFAULT '0',
  `DtCr` varchar(5) COLLATE utf8_bin DEFAULT NULL,
  `Remarks` longtext COLLATE utf8_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `ProductID` int(11) NOT NULL,
  `Category` int(11) DEFAULT '0',
  `PCode` varchar(15) COLLATE utf8_bin DEFAULT NULL,
  `ProductName` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Packing` smallint(6) DEFAULT '0',
  `PPrice` double DEFAULT '0',
  `SPrice` double DEFAULT '0',
  `Stock` double DEFAULT '0',
  `UnitID` int(11) DEFAULT NULL,
  `MRP` double DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `productstatus`
--

DROP TABLE IF EXISTS `productstatus`;
CREATE TABLE `productstatus` (
  `StatusID` int(11) NOT NULL DEFAULT '0',
  `Status` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `pwd`
--

DROP TABLE IF EXISTS `pwd`;
CREATE TABLE `pwd` (
  `ID` int(11) NOT NULL,
  `Pwd` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Stand-in structure for view `qrybooking`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qrybooking`;
CREATE TABLE `qrybooking` (
`CustomerName` varchar(50)
,`BookingID` int(11)
,`InvoiceNo` varchar(50)
,`SupplierID` int(11)
,`InvoiceDate` datetime
,`Date` datetime
,`VehicleNo` varchar(50)
,`CofNo` int(11)
,`BuiltyNo` int(11)
,`ReceiptNo` int(11)
,`Amount` double
,`Discount` double
,`Carriage` double
,`NetAmount` double
,`DtCr` varchar(5)
,`Remarks` longtext
,`IsPosted` int(3)
,`ClosingID` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qrybookingpurchase`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qrybookingpurchase`;
CREATE TABLE `qrybookingpurchase` (
`DetailID` int(11)
,`BookingID` int(11)
,`ProductID` int(11)
,`Qty` int(11)
,`Price` double
,`Amount` double
,`DiscRatio` double
,`Type` int(11)
,`Packing` int(11)
,`ProductName` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qrybookingsale`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qrybookingsale`;
CREATE TABLE `qrybookingsale` (
`CustomerName` varchar(50)
,`CustomerID` int(11)
,`DetailID` int(11)
,`BookingID` int(11)
,`ProductID` int(11)
,`Qty` int(11)
,`Price` double
,`Discount` double
,`Amount` double
,`MRP` double
,`TaxRatio` double
,`Received` double
,`Type` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qrycategories`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qrycategories`;
CREATE TABLE `qrycategories` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qrycities`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qrycities`;
CREATE TABLE `qrycities` (
`City` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qrycustomers`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qrycustomers`;
CREATE TABLE `qrycustomers` (
`CustomerName` varchar(50)
,`Address` varchar(250)
,`City` varchar(50)
,`PhoneNo` varchar(50)
,`Balance` decimal(18,2)
,`CustomerID` int(11)
,`AcctTypeID` int(11)
,`Status` smallint(6)
,`NTNNo` varchar(50)
,`CNICNo` varchar(50)
,`TaxActive` int(11)
,`BalQty` double
,`Commission` decimal(18,0)
,`Limit` decimal(18,0)
,`AcctType` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qryinvoicedetails`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qryinvoicedetails`;
CREATE TABLE `qryinvoicedetails` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qryinvoices`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qryinvoices`;
CREATE TABLE `qryinvoices` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qryorderdetails`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qryorderdetails`;
CREATE TABLE `qryorderdetails` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qryorderreport`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qryorderreport`;
CREATE TABLE `qryorderreport` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qryorders`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qryorders`;
CREATE TABLE `qryorders` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qryproducts`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qryproducts`;
CREATE TABLE `qryproducts` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qrysalereport`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qrysalereport`;
CREATE TABLE `qrysalereport` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `qryvouchers`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `qryvouchers`;
CREATE TABLE `qryvouchers` (
`VoucherID` int(11)
,`Date` date
,`CustomerName` varchar(50)
,`Address` varchar(250)
,`City` varchar(50)
,`Description` varchar(50)
,`Debit` float
,`Credit` float
,`IsPosted` int(11)
,`CustomerID` int(11)
,`Status` varchar(8)
,`VoucherType` int(1)
,`Balance` decimal(18,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `salesman`
--

DROP TABLE IF EXISTS `salesman`;
CREATE TABLE `salesman` (
  `SalesmanID` int(11) NOT NULL,
  `SalesmanName` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `Address` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `PhoneNo` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `City` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `SessionID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT '0',
  `StartDate` datetime DEFAULT NULL,
  `CloseDate` datetime DEFAULT NULL,
  `StartTime` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `CloseTime` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `TotalSale` double DEFAULT '0',
  `Status` int(11) DEFAULT '0',
  `upsize_ts` tinyblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
CREATE TABLE `status` (
  `StatusID` int(11) NOT NULL,
  `Status` varchar(255) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `stockpos`
--

DROP TABLE IF EXISTS `stockpos`;
CREATE TABLE `stockpos` (
  `StockPos` int(11) NOT NULL,
  `Date` datetime DEFAULT NULL,
  `StockPValue` double DEFAULT '0',
  `StockSValue` double DEFAULT '0',
  `PharmacyPvalue` double DEFAULT '0',
  `PharmacySValue` double DEFAULT '0',
  `upsize_ts` tinyblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `supplieraccts`
--

DROP TABLE IF EXISTS `supplieraccts`;
CREATE TABLE `supplieraccts` (
  `PartyAcctsID` int(11) NOT NULL,
  `SupplierID` int(11) DEFAULT '0',
  `InvoiceID` int(11) DEFAULT '0',
  `Date` datetime DEFAULT NULL,
  `Description` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Amount` double DEFAULT '0',
  `Paid` double DEFAULT '0',
  `Balance` double DEFAULT '0',
  `upsize_ts` tinyblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `supplierprod`
--

DROP TABLE IF EXISTS `supplierprod`;
CREATE TABLE `supplierprod` (
  `ID` int(11) NOT NULL,
  `SupplierID` int(11) DEFAULT '0',
  `ProductID` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `SupplierID` int(11) NOT NULL,
  `SupplierName` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Address` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `City` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `PhNo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Balance` double DEFAULT '0',
  `PaymentTerms` varchar(25) COLLATE utf8_bin DEFAULT NULL,
  `Status` int(11) DEFAULT '0',
  `upsize_ts` tinyblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `syscolwidths`
--

DROP TABLE IF EXISTS `syscolwidths`;
CREATE TABLE `syscolwidths` (
  `ID` int(11) NOT NULL,
  `FormName` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `CtrlName` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `ColName` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Width` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `tbldelivery`
--

DROP TABLE IF EXISTS `tbldelivery`;
CREATE TABLE `tbldelivery` (
  `ID` int(11) NOT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  `ProductID` int(11) DEFAULT NULL,
  `Qty` double DEFAULT NULL,
  `Rate` double DEFAULT NULL,
  `Recieved` double DEFAULT NULL,
  `Discount` double DEFAULT NULL,
  `MRPrice` double DEFAULT '0',
  `TaxRatio` double DEFAULT '0',
  `PPrice` double DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
CREATE TABLE `units` (
  `ID` int(11) NOT NULL,
  `Value` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Cat` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `usergrouprights`
--

DROP TABLE IF EXISTS `usergrouprights`;
CREATE TABLE `usergrouprights` (
  `usergroupid` int(11) NOT NULL,
  `groupid` int(11) NOT NULL,
  `pageid` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BusinessID` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB AVG_ROW_LENGTH=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `usergroups`
--

DROP TABLE IF EXISTS `usergroups`;
CREATE TABLE `usergroups` (
  `GroupID` int(11) NOT NULL,
  `GroupName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BusinessID` int(11) DEFAULT NULL
) ENGINE=InnoDB AVG_ROW_LENGTH=8192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `FullName` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Address` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PhoneNo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UserName` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Status` int(11) DEFAULT '0',
  `GroupID` int(11) DEFAULT NULL,
  `BusinessID` int(11) NOT NULL
) ENGINE=InnoDB AVG_ROW_LENGTH=4096 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE `vouchers` (
  `VoucherID` int(11) NOT NULL,
  `Date` date DEFAULT NULL,
  `AcctType` int(11) DEFAULT NULL,
  `CustomerID` int(11) DEFAULT '0',
  `Description` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Debit` float DEFAULT '0',
  `Credit` float DEFAULT '0',
  `RefID` float DEFAULT '0',
  `RefType` int(11) DEFAULT NULL,
  `FinYearID` int(11) DEFAULT '0',
  `IsPosted` int(11) NOT NULL DEFAULT '0',
  `BusinessID` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB AVG_ROW_LENGTH=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Structure for view `qrybooking`
--
DROP TABLE IF EXISTS `qrybooking`;

DROP VIEW IF EXISTS `qrybooking`;
CREATE VIEW `qrybooking`  AS SELECT `customers`.`CustomerName` AS `CustomerName`, `booking`.`BookingID` AS `BookingID`, `booking`.`InvoiceNo` AS `InvoiceNo`, `booking`.`SupplierID` AS `SupplierID`, `booking`.`InvoiceDate` AS `InvoiceDate`, `booking`.`Date` AS `Date`, `booking`.`VehicleNo` AS `VehicleNo`, `booking`.`CofNo` AS `CofNo`, `booking`.`BuiltyNo` AS `BuiltyNo`, `booking`.`ReceiptNo` AS `ReceiptNo`, `booking`.`Amount` AS `Amount`, `booking`.`Discount` AS `Discount`, `booking`.`Carriage` AS `Carriage`, `booking`.`NetAmount` AS `NetAmount`, `booking`.`DtCr` AS `DtCr`, `booking`.`Remarks` AS `Remarks`, `booking`.`IsPosted` AS `IsPosted`, `booking`.`ClosingID` AS `ClosingID` FROM (`booking` join `customers` on((`booking`.`SupplierID` = `customers`.`CustomerID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qrybookingpurchase`
--
DROP TABLE IF EXISTS `qrybookingpurchase`;

DROP VIEW IF EXISTS `qrybookingpurchase`;
CREATE VIEW `qrybookingpurchase`  AS SELECT `booking_details`.`DetailID` AS `DetailID`, `booking_details`.`BookingID` AS `BookingID`, `booking_details`.`ProductID` AS `ProductID`, `booking_details`.`Qty` AS `Qty`, `booking_details`.`PPrice` AS `Price`, (`booking_details`.`Qty` * `booking_details`.`PPrice`) AS `Amount`, `booking_details`.`DiscRatio` AS `DiscRatio`, `booking_details`.`Type` AS `Type`, `booking_details`.`Packing` AS `Packing`, `products`.`ProductName` AS `ProductName` FROM (`booking_details` join `products` on((`booking_details`.`ProductID` = `products`.`ProductID`))) WHERE (`booking_details`.`Type` = 1) ;

-- --------------------------------------------------------

--
-- Structure for view `qrybookingsale`
--
DROP TABLE IF EXISTS `qrybookingsale`;

DROP VIEW IF EXISTS `qrybookingsale`;
CREATE VIEW `qrybookingsale`  AS SELECT `customers`.`CustomerName` AS `CustomerName`, `booking_details`.`CustomerID` AS `CustomerID`, `booking_details`.`DetailID` AS `DetailID`, `booking_details`.`BookingID` AS `BookingID`, `booking_details`.`ProductID` AS `ProductID`, `booking_details`.`Qty` AS `Qty`, `booking_details`.`SPrice` AS `Price`, `booking_details`.`Discount` AS `Discount`, (`booking_details`.`Qty` * `booking_details`.`SPrice`) AS `Amount`, `booking_details`.`MRP` AS `MRP`, `booking_details`.`TaxRatio` AS `TaxRatio`, `booking_details`.`Received` AS `Received`, `booking_details`.`Type` AS `Type` FROM (`booking_details` join `customers` on((`booking_details`.`CustomerID` = `customers`.`CustomerID`))) WHERE (`booking_details`.`Type` = 2) ;

-- --------------------------------------------------------

--
-- Structure for view `qrycategories`
--
DROP TABLE IF EXISTS `qrycategories`;

DROP VIEW IF EXISTS `qrycategories`;
CREATE VIEW `qrycategories`  AS SELECT `categories`.`CategoryID` AS `CategoryID`, `categories`.`CategoryName` AS `CategoryName`, ifnull((select `products`.`Image` from `products` where (`products`.`CategoryID` = `categories`.`CategoryID`) limit 1),'apis/uploads/dummy.jpg') AS `ImageUrl` FROM `categories` ;

-- --------------------------------------------------------

--
-- Structure for view `qrycities`
--
DROP TABLE IF EXISTS `qrycities`;

DROP VIEW IF EXISTS `qrycities`;
CREATE VIEW `qrycities`  AS SELECT DISTINCT `c`.`City` AS `City` FROM `customers` AS `c` ;

-- --------------------------------------------------------

--
-- Structure for view `qrycustomers`
--
DROP TABLE IF EXISTS `qrycustomers`;

DROP VIEW IF EXISTS `qrycustomers`;
CREATE VIEW `qrycustomers`  AS SELECT `customers`.`CustomerName` AS `CustomerName`, `customers`.`Address` AS `Address`, `customers`.`City` AS `City`, `customers`.`PhoneNo` AS `PhoneNo`, `customers`.`Balance` AS `Balance`, `customers`.`CustomerID` AS `CustomerID`, `customers`.`AcctTypeID` AS `AcctTypeID`, `customers`.`Status` AS `Status`, `customers`.`NTNNo` AS `NTNNo`, `customers`.`CNICNo` AS `CNICNo`, `customers`.`TaxActive` AS `TaxActive`, `customers`.`BalQty` AS `BalQty`, `customers`.`Commission` AS `Commission`, `customers`.`Limit` AS `Limit`, `accttypes`.`AcctType` AS `AcctType` FROM (`accttypes` join `customers` on((`accttypes`.`AcctTypeID` = `customers`.`AcctTypeID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qryinvoicedetails`
--
DROP TABLE IF EXISTS `qryinvoicedetails`;

DROP VIEW IF EXISTS `qryinvoicedetails`;
CREATE VIEW `qryinvoicedetails`  AS SELECT `invoicedetails`.`DetailID` AS `DetailID`, `invoicedetails`.`InvoiceID` AS `invoiceID`, `invoicedetails`.`ProductID` AS `ProductID`, `invoicedetails`.`Qty` AS `Qty`, `invoicedetails`.`SPrice` AS `SPrice`, `products`.`ProductName` AS `ProductName`, (`invoicedetails`.`SPrice` * `invoicedetails`.`Qty`) AS `Amount`, `products`.`Image` AS `Image`, `invoicedetails`.`Color` AS `Color`, `invoicedetails`.`Size` AS `Size`, `invoicedetails`.`Notes` AS `Notes` FROM (`invoicedetails` join `products` on((`invoicedetails`.`ProductID` = `products`.`ProductID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qryinvoices`
--
DROP TABLE IF EXISTS `qryinvoices`;

DROP VIEW IF EXISTS `qryinvoices`;
CREATE VIEW `qryinvoices`  AS SELECT `invoices`.`Date` AS `Date`, `invoices`.`InvoiceID` AS `InvoiceID`, `customers`.`CustomerName` AS `CustomerName`, `customers`.`Address` AS `Address`, `customers`.`City` AS `City`, `invoices`.`CustomerID` AS `CustomerID`, `invoices`.`Amount` AS `Amount`, `invoices`.`IsPosted` AS `IsPosted`, (case `invoices`.`IsPosted` when 1 then 'Posted' when 0 then 'Un-Posted' when -(1) then 'Cancelled' end) AS `Status`, `invoices`.`OrderID` AS `OrderID`, `invoices`.`DtCr` AS `DtCr` FROM (`invoices` join `customers` on((`invoices`.`CustomerID` = `customers`.`CustomerID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qryorderdetails`
--
DROP TABLE IF EXISTS `qryorderdetails`;

DROP VIEW IF EXISTS `qryorderdetails`;
CREATE VIEW `qryorderdetails`  AS SELECT `orderdetails`.`DetailID` AS `DetailID`, `orderdetails`.`OrderID` AS `OrderID`, `orderdetails`.`ProductID` AS `ProductID`, `orderdetails`.`Qty` AS `Qty`, `orderdetails`.`SPrice` AS `SPrice`, `products`.`ProductName` AS `ProductName`, (`orderdetails`.`SPrice` * `orderdetails`.`Qty`) AS `Amount`, `products`.`Image` AS `Image`, `orderdetails`.`Color` AS `Color`, `orderdetails`.`Size` AS `Size`, `orderdetails`.`Notes` AS `Notes` FROM (`orderdetails` join `products` on((`orderdetails`.`ProductID` = `products`.`ProductID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qryorderreport`
--
DROP TABLE IF EXISTS `qryorderreport`;

DROP VIEW IF EXISTS `qryorderreport`;
CREATE VIEW `qryorderreport`  AS SELECT `orderdetails`.`DetailID` AS `DetailID`, `orderdetails`.`OrderID` AS `OrderID`, `orderdetails`.`ProductID` AS `ProductID`, `orderdetails`.`Qty` AS `Qty`, `orderdetails`.`SPrice` AS `SPrice`, `products`.`ProductName` AS `ProductName`, (`orderdetails`.`SPrice` * `orderdetails`.`Qty`) AS `Amount`, `products`.`Image` AS `Image`, `orderdetails`.`Color` AS `Color`, `orderdetails`.`Size` AS `Size`, `orderdetails`.`Notes` AS `Notes`, `orders`.`Date` AS `Date`, `customers`.`CustomerName` AS `CustomerName`, `customers`.`Address` AS `Address`, `customers`.`City` AS `City`, `customers`.`PhoneNo1` AS `PhoneNo1`, `orders`.`Amount` AS `OrderAmount`, `customers`.`PhoneNo2` AS `PhoneNo2` FROM (((`orderdetails` join `products` on((`orderdetails`.`ProductID` = `products`.`ProductID`))) join `orders` on((`orders`.`OrderID` = `orderdetails`.`OrderID`))) join `customers` on((`customers`.`CustomerID` = `orders`.`CustomerID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qryorders`
--
DROP TABLE IF EXISTS `qryorders`;

DROP VIEW IF EXISTS `qryorders`;
CREATE VIEW `qryorders`  AS SELECT `orders`.`Date` AS `Date`, `orders`.`OrderID` AS `OrderID`, `customers`.`CustomerName` AS `CustomerName`, `customers`.`Address` AS `Address`, `customers`.`City` AS `City`, `orders`.`CustomerID` AS `CustomerID`, `orders`.`Amount` AS `Amount`, `orders`.`IsPosted` AS `IsPosted`, (case `orders`.`IsPosted` when 1 then 'Posted' when 0 then 'Un-Posted' when -(1) then 'Cancelled' end) AS `Status` FROM (`orders` join `customers` on((`orders`.`CustomerID` = `customers`.`CustomerID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qryproducts`
--
DROP TABLE IF EXISTS `qryproducts`;

DROP VIEW IF EXISTS `qryproducts`;
CREATE VIEW `qryproducts`  AS SELECT `p`.`ProductID` AS `ProductID`, `p`.`CategoryID` AS `CategoryID`, `p`.`ProductName` AS `ProductName`, `p`.`SPrice` AS `SPrice`, `p`.`Image` AS `Image`, `categories`.`CategoryName` AS `CategoryName` FROM (`categories` join `products` `p` on((`categories`.`CategoryID` = `p`.`CategoryID`))) ;

-- --------------------------------------------------------

--
-- Structure for view `qrysalereport`
--
DROP TABLE IF EXISTS `qrysalereport`;

DROP VIEW IF EXISTS `qrysalereport`;
CREATE VIEW `qrysalereport`  AS SELECT `invoicedetails`.`DetailID` AS `DetailID`, `invoicedetails`.`InvoiceID` AS `invoiceID`, `invoicedetails`.`ProductID` AS `ProductID`, `invoicedetails`.`Qty` AS `Qty`, `invoicedetails`.`SPrice` AS `SPrice`, `products`.`ProductName` AS `ProductName`, (`invoicedetails`.`SPrice` * `invoicedetails`.`Qty`) AS `Amount`, `products`.`Image` AS `Image`, `invoicedetails`.`Color` AS `Color`, `invoicedetails`.`Size` AS `Size`, `invoicedetails`.`Notes` AS `Notes`, `invoices`.`Date` AS `Date`, `customers`.`CustomerName` AS `CustomerName`, `customers`.`Address` AS `Address`, `customers`.`City` AS `City`, `customers`.`PhoneNo1` AS `PhoneNo1`, `customers`.`PhoneNo2` AS `PhoneNo2` FROM (((`invoicedetails` join `products` on((`invoicedetails`.`ProductID` = `products`.`ProductID`))) join `customers`) join `invoices` on(((`customers`.`CustomerID` = `invoices`.`CustomerID`) and (`invoices`.`InvoiceID` = `invoicedetails`.`InvoiceID`)))) ;

-- --------------------------------------------------------

--
-- Structure for view `qryvouchers`
--
DROP TABLE IF EXISTS `qryvouchers`;

DROP VIEW IF EXISTS `qryvouchers`;
CREATE VIEW `qryvouchers`  AS SELECT `vouchers`.`VoucherID` AS `VoucherID`, `vouchers`.`Date` AS `Date`, `customers`.`CustomerName` AS `CustomerName`, `customers`.`Address` AS `Address`, `customers`.`City` AS `City`, `vouchers`.`Description` AS `Description`, `vouchers`.`Debit` AS `Debit`, `vouchers`.`Credit` AS `Credit`, `vouchers`.`IsPosted` AS `IsPosted`, `vouchers`.`CustomerID` AS `CustomerID`, (case `vouchers`.`IsPosted` when 0 then 'UnPosted' else 'Posted' end) AS `Status`, (case when (`vouchers`.`Credit` > 0) then 1 else 2 end) AS `VoucherType`, `customers`.`Balance` AS `Balance` FROM (`vouchers` join `customers` on((`vouchers`.`CustomerID` = `customers`.`CustomerID`))) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accttypes`
--
ALTER TABLE `accttypes`
  ADD PRIMARY KEY (`AcctTypeID`),
  ADD KEY `AcctTypes_AcctTypeID` (`AcctTypeID`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`BookingID`),
  ADD KEY `Booking_BookingID` (`BookingID`),
  ADD KEY `SupplierID` (`SupplierID`),
  ADD KEY `Date` (`Date`),
  ADD KEY `DtCr` (`DtCr`),
  ADD KEY `IsPosted` (`IsPosted`);

--
-- Indexes for table `booking_details`
--
ALTER TABLE `booking_details`
  ADD PRIMARY KEY (`DetailID`),
  ADD KEY `BookingID` (`BookingID`),
  ADD KEY `ProductID` (`ProductID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `business`
--
ALTER TABLE `business`
  ADD PRIMARY KEY (`BusinessID`);

--
-- Indexes for table `cashbook`
--
ALTER TABLE `cashbook`
  ADD PRIMARY KEY (`CashID`),
  ADD KEY `CashBook_HeadID` (`AcctID`),
  ADD KEY `CashBook_ID` (`CashID`),
  ADD KEY `CashBook_Paid` (`Paid`);

--
-- Indexes for table `cashtypes`
--
ALTER TABLE `cashtypes`
  ADD PRIMARY KEY (`TypeID`),
  ADD KEY `CashTypes_TypeID` (`TypeID`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`CatID`),
  ADD KEY `Categories_CatCode` (`CatCode`),
  ADD KEY `Categories_CatID` (`CatID`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`CityID`),
  ADD KEY `Cities_cittyID` (`CityID`);

--
-- Indexes for table `closing`
--
ALTER TABLE `closing`
  ADD PRIMARY KEY (`ClosingID`);

--
-- Indexes for table `comdetails`
--
ALTER TABLE `comdetails`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `customeraccts`
--
ALTER TABLE `customeraccts`
  ADD PRIMARY KEY (`CustomerAcctID`),
  ADD KEY `CustomerAccts_partyAcctsID` (`CustomerAcctID`),
  ADD KEY `CustomerAccts_PartyID` (`CustomerID`),
  ADD KEY `CustomerAccts_PInvoiceID` (`InvoiceID`),
  ADD KEY `Date` (`Date`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`CustomerID`),
  ADD KEY `Customers_DesigID` (`AcctTypeID`),
  ADD KEY `Customers_patientID` (`CustomerID`);

--
-- Indexes for table `desigs`
--
ALTER TABLE `desigs`
  ADD PRIMARY KEY (`DesigID`),
  ADD KEY `Desigs_DesigID` (`DesigID`);

--
-- Indexes for table `expend`
--
ALTER TABLE `expend`
  ADD PRIMARY KEY (`ExpedID`),
  ADD KEY `Expend_ExpedID` (`ExpedID`),
  ADD KEY `Expend_headid` (`headid`);

--
-- Indexes for table `expenseheads`
--
ALTER TABLE `expenseheads`
  ADD PRIMARY KEY (`HeadID`),
  ADD KEY `ExpenseHeads_HeadID` (`HeadID`);

--
-- Indexes for table `invoicedetails`
--
ALTER TABLE `invoicedetails`
  ADD PRIMARY KEY (`InvoiceDetailID`),
  ADD KEY `InvoiceDetails_InvoiceDetailID` (`InvoiceDetailID`),
  ADD KEY `InvoiceDetails_InvoiceID` (`InvoiceID`),
  ADD KEY `InvoiceDetails_ProductID` (`ProductID`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`InvoiceID`),
  ADD KEY `Invoices_CustomerName` (`CustomerID`),
  ADD KEY `Invoices_InvoiceID` (`InvoiceID`),
  ADD KEY `Date` (`Date`);

--
-- Indexes for table `modific`
--
ALTER TABLE `modific`
  ADD PRIMARY KEY (`ModID`),
  ADD KEY `Modific_ModID` (`ModID`),
  ADD KEY `Modific_STockID` (`STockID`);

--
-- Indexes for table `pinvoicedetails`
--
ALTER TABLE `pinvoicedetails`
  ADD PRIMARY KEY (`DetailID`),
  ADD KEY `PInvoiceDetails_InvoiceID` (`InvoiceID`),
  ADD KEY `PInvoiceDetails_MedicineID` (`ProductID`),
  ADD KEY `PInvoiceDetails_PurchaseID` (`DetailID`);

--
-- Indexes for table `pinvoices`
--
ALTER TABLE `pinvoices`
  ADD PRIMARY KEY (`InvoiceID`),
  ADD KEY `PInvoices_CustomerName` (`SupplierID`),
  ADD KEY `PInvoices_InvoiceID` (`InvoiceID`),
  ADD KEY `Booking_SupplierID` (`SupplierID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `productstatus`
--
ALTER TABLE `productstatus`
  ADD PRIMARY KEY (`StatusID`),
  ADD KEY `ProductStatus_StatusID` (`StatusID`);

--
-- Indexes for table `pwd`
--
ALTER TABLE `pwd`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `salesman`
--
ALTER TABLE `salesman`
  ADD PRIMARY KEY (`SalesmanID`),
  ADD KEY `Salesman_SalesmanID` (`SalesmanID`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`SessionID`),
  ADD KEY `Session_SessionID` (`SessionID`),
  ADD KEY `Session_UserID` (`UserID`);

--
-- Indexes for table `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`StatusID`),
  ADD KEY `Status_StatusID` (`StatusID`);

--
-- Indexes for table `stockpos`
--
ALTER TABLE `stockpos`
  ADD PRIMARY KEY (`StockPos`);

--
-- Indexes for table `supplieraccts`
--
ALTER TABLE `supplieraccts`
  ADD PRIMARY KEY (`PartyAcctsID`),
  ADD KEY `SupplierAccts_partyAcctsID` (`PartyAcctsID`),
  ADD KEY `SupplierAccts_PartyID` (`SupplierID`),
  ADD KEY `SupplierAccts_PInvoiceID` (`InvoiceID`);

--
-- Indexes for table `supplierprod`
--
ALTER TABLE `supplierprod`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `SupplierProd_CompanyID` (`ProductID`),
  ADD KEY `SupplierProd_ID` (`ID`),
  ADD KEY `SupplierProd_PartyID` (`SupplierID`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`SupplierID`),
  ADD KEY `Suppliers_SupplierID` (`SupplierID`);

--
-- Indexes for table `syscolwidths`
--
ALTER TABLE `syscolwidths`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `sysColWidths_ID` (`ID`);

--
-- Indexes for table `tbldelivery`
--
ALTER TABLE `tbldelivery`
  ADD KEY `tblDelivery_AutoIDX_ID` (`ID`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `Units_ID` (`ID`);

--
-- Indexes for table `usergrouprights`
--
ALTER TABLE `usergrouprights`
  ADD PRIMARY KEY (`usergroupid`);

--
-- Indexes for table `usergroups`
--
ALTER TABLE `usergroups`
  ADD PRIMARY KEY (`GroupID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`);

--
-- Indexes for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`VoucherID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accttypes`
--
ALTER TABLE `accttypes`
  MODIFY `AcctTypeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `BookingID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_details`
--
ALTER TABLE `booking_details`
  MODIFY `DetailID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `business`
--
ALTER TABLE `business`
  MODIFY `BusinessID` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cashbook`
--
ALTER TABLE `cashbook`
  MODIFY `CashID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `CatID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `CityID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `closing`
--
ALTER TABLE `closing`
  MODIFY `ClosingID` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comdetails`
--
ALTER TABLE `comdetails`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customeraccts`
--
ALTER TABLE `customeraccts`
  MODIFY `CustomerAcctID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `desigs`
--
ALTER TABLE `desigs`
  MODIFY `DesigID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expend`
--
ALTER TABLE `expend`
  MODIFY `ExpedID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenseheads`
--
ALTER TABLE `expenseheads`
  MODIFY `HeadID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoicedetails`
--
ALTER TABLE `invoicedetails`
  MODIFY `InvoiceDetailID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `InvoiceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `modific`
--
ALTER TABLE `modific`
  MODIFY `ModID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pinvoicedetails`
--
ALTER TABLE `pinvoicedetails`
  MODIFY `DetailID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pinvoices`
--
ALTER TABLE `pinvoices`
  MODIFY `InvoiceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pwd`
--
ALTER TABLE `pwd`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesman`
--
ALTER TABLE `salesman`
  MODIFY `SalesmanID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session`
--
ALTER TABLE `session`
  MODIFY `SessionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `status`
--
ALTER TABLE `status`
  MODIFY `StatusID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockpos`
--
ALTER TABLE `stockpos`
  MODIFY `StockPos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplieraccts`
--
ALTER TABLE `supplieraccts`
  MODIFY `PartyAcctsID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplierprod`
--
ALTER TABLE `supplierprod`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `SupplierID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `syscolwidths`
--
ALTER TABLE `syscolwidths`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbldelivery`
--
ALTER TABLE `tbldelivery`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usergrouprights`
--
ALTER TABLE `usergrouprights`
  MODIFY `usergroupid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usergroups`
--
ALTER TABLE `usergroups`
  MODIFY `GroupID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
