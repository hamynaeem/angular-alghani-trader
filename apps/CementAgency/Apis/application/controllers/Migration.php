<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require APPPATH . 'libraries/REST_Controller.php';

use Restserver\Libraries\REST_Controller;

class Migration extends REST_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    // Run IsPosted migration for transportdetails (GET for quick browser access)
    public function run_isposted_get() {
        // Prevent running on production
        if (defined('ENVIRONMENT') && ENVIRONMENT === 'production') {
            $this->response(['status' => false, 'message' => 'Migration not allowed in production'], REST_Controller::HTTP_FORBIDDEN);
            return;
        }

        // Check table exists
        $q = $this->db->query("SHOW TABLES LIKE 'transportdetails'");
        if ($q->num_rows() === 0) {
            $this->response(['status' => false, 'message' => "Table 'transportdetails' not found"], REST_Controller::HTTP_BAD_REQUEST);
            return;
        }

        // Check column existence
        $schema = $this->db->query("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transportdetails' AND COLUMN_NAME = 'IsPosted'")->row_array();
        if ($schema && intval($schema['cnt']) > 0) {
            // normalize nulls
            $this->db->query("UPDATE `transportdetails` SET `IsPosted` = 0 WHERE `IsPosted` IS NULL");
            $this->response(['status' => true, 'message' => "Column already exists. Normalized NULL values."], REST_Controller::HTTP_OK);
            return;
        }

        // Attempt to add column
        try {
            $this->db->query("ALTER TABLE `transportdetails` ADD COLUMN `IsPosted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Balance`");
        } catch (Exception $e) {
            $err = $this->db->error();
            $this->response(['status' => false, 'message' => 'ALTER failed', 'db_error' => $err], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        // Normalize any NULLs
        $this->db->query("UPDATE `transportdetails` SET `IsPosted` = 0 WHERE `IsPosted` IS NULL");

        $this->response(['status' => true, 'message' => "Migration completed: IsPosted column added and normalized."], REST_Controller::HTTP_OK);
    }

    // Add BusinessID column to transportdetails if missing
    public function run_businessid_get() {
        // Prevent running on production
        if (defined('ENVIRONMENT') && ENVIRONMENT === 'production') {
            $this->response(['status' => false, 'message' => 'Migration not allowed in production'], REST_Controller::HTTP_FORBIDDEN);
            return;
        }

        // Check table exists
        $q = $this->db->query("SHOW TABLES LIKE 'transportdetails'");
        if ($q->num_rows() === 0) {
            $this->response(['status' => false, 'message' => "Table 'transportdetails' not found"], REST_Controller::HTTP_BAD_REQUEST);
            return;
        }

        // Check column existence
        $schema = $this->db->query("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transportdetails' AND COLUMN_NAME = 'BusinessID'")->row_array();
        if ($schema && intval($schema['cnt']) > 0) {
            // normalize nulls
            $this->db->query("UPDATE `transportdetails` SET `BusinessID` = 0 WHERE `BusinessID` IS NULL");
            $this->response(['status' => true, 'message' => "Column already exists. Normalized NULL values."], REST_Controller::HTTP_OK);
            return;
        }

        // Attempt to add column
        try {
            $this->db->query("ALTER TABLE `transportdetails` ADD COLUMN `BusinessID` INT NOT NULL DEFAULT 0 AFTER `Balance`");
        } catch (Exception $e) {
            $err = $this->db->error();
            $this->response(['status' => false, 'message' => 'ALTER failed', 'db_error' => $err], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        // Normalize any NULLs
        $this->db->query("UPDATE `transportdetails` SET `BusinessID` = 0 WHERE `BusinessID` IS NULL");

        $this->response(['status' => true, 'message' => "Migration completed: BusinessID column added and normalized."], REST_Controller::HTTP_OK);
    }
}
