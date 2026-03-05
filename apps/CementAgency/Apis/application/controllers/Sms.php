<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
/** @noinspection PhpIncludeInspection */
require APPPATH . '/libraries/REST_Controller.php';

use Restserver\Libraries\REST_Controller;

class Sms extends REST_Controller {

    function __construct() {

        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        parent::__construct();

        $this->load->database();
    }
    public function index_get(){

    }

    public function index_post()
    {

    }



    function getlist_get($dtefrm, $dteto) {
        $sQry = "Date Between '" . $dtefrm . "' And '" . $dteto .  "'";

		//echo ("Select Name, Address, City, PhNo, CustomerID from Customers where customerid in (select distinct customerid from CustomerAccts where " . $sQry . ") Order by Name");
		$rs = $this->db->query("Select Name, Address, City, PhNo, CustomerID from Customers where customerid in " .
			  "(select distinct customerid from CustomerAccts where " . $sQry . ") Order by Name")
			  ->result_array();

		foreach($rs as &$cust){



			$smsLine= "";
			$smsData = $this->getSmsData($cust['CustomerID'], $dtefrm, $dteto);
			$smsLine = "Name: " . $cust['Name'] . "\r\n";
			$smsLine .= "Date: " . date("d-M-Y",strtotime ($dtefrm)) . "\r\n";
    	$smsLine .= " ----------------------" . "\r\n";

			$smsLine .= str_pad("Descrip", 8) . $this->sPR("Wt", 6) . $this->sPR("Rate", 6) . $this->sPR("Amount", 8) . "\r\n";
			$oBalance = $smsData[0]['Balance'] - $smsData[0]['Amount'] + $smsData[0]['Recived'];
			$payments = 0;
			$Weight = 0;
			$saleAmnt = 0;
			foreach($smsData as $sms) {

				If ($sms['Qty'] > 0) {
					$smsLine .= str_pad($sms['Description'], 8) . $this->sPR($sms['Qty'], 6)
						. $this->sPR($sms['Rate'], 6) . $this->sPR($sms['Qty'] * $sms['Rate'], 8) . "\r\n";
					$Weight += $Weight + $sms['Qty'];

				}
				If ($sms['Type'] == 2) {
				   $saleAmnt += $saleAmnt + $sms['Qty'] * $sms['Rate'] * -1;
				   $payments += $payments + $sms['Amount'] - $sms['Recived'];
				} else {
				   $saleAmnt += $saleAmnt + $sms['Qty'] * $sms['Rate'];
				   $payments += $payments + $sms['Amount'] - $sms['Recived'];
				}
				$cBalance = $sms['Balance'];
			}

			$smsLine .= " ----------------------" . "\r\n";
			$smsLine .= str_pad("Totals:", 8) .str_pad($Weight , 8) .str_pad ($saleAmnt , 8) . "\r\n";
			$smsLine .= $this->sPL("P/Balance:", 10) . $this->sPR($oBalance , 12) . "\r\n";
			$smsLine .= $this->sPL("T/Amount:", 10) . $this->sPR(($oBalance + $saleAmnt) , 12) . "\r\n";
			$smsLine .= $this->sPL("Payments:", 10) . $this->sPR(($payments - $saleAmnt) , 12) . "\r\n";
			$smsLine .= $this->sPL("T/Balance:", 10) . $this->sPR($cBalance , 12) . "\r\n";

			$cust['SMS'] = $smsLine;
		}
		$this->response($rs, REST_Controller::HTTP_OK);
    }
	function sPL($str, $pad){
		return  str_pad($str, $pad);
	}
	function sPR($str, $pad){
		return  str_pad($str, $pad," ",STR_PAD_LEFT);
	}

	function getSmsData($acctid, $dtefrm, $dteto) {
        $sQry = "Date Between '" . $dtefrm . "' And '" . $dteto .  "'";

		$Res = $this->db->query("select * from CustomerAccts where CustomerID = " . $acctid . " and " . $sQry . " Order By CustomerAcctID")
				->result_array();
   // print_r($Res);
		return $Res;


    }

}
