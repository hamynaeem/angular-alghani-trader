<?php
defined('BASEPATH') or exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
/** @noinspection PhpIncludeInspection */
require APPPATH . '/libraries/REST_Controller.php';
require_once APPPATH . '/libraries/JWT.php';

use Restserver\Libraries\REST_Controller;
use \Firebase\JWT\JWT;

class Tasks extends REST_Controller
{
    private $userID = 0;
    public function __construct()
    {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        header('Pragma: no-cache');
        header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        parent::__construct();
        date_default_timezone_set("Asia/Karachi");
        $this->load->database();
        $this->load->library('utilities');
    }
    public function index_get()
    {
        header('Access-Control-Allow-Headers: X-Requested-With, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers');
        $this->response(null, REST_Controller::HTTP_OK);
    }
    public function index_options()
    {
        header('Access-Control-Allow-Headers: X-Requested-With, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers');
        $this->response(null, REST_Controller::HTTP_OK);
    }

    public function index_post()
    {
        header('Access-Control-Allow-Headers: X-Requested-With, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers');
        $this->response(true, REST_Controller::HTTP_OK);
    }
    public function savedelivery_post()
    {
        $post_data = $this->post();

        foreach ($post_data as $data) {

            $this->db->where('DeliveryID', $data['DeliveryID']);
            if (! $this->db->update('gatepassdelivery', ['Delivered' => $data['Delivered'],

            ])) {

                $this->response(['status' => false,
                    'msg'                     => $this->db->error()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }
        }
        $this->response(['status' => true,
            'msg'                     => 'Data updated successfully'], REST_Controller::HTTP_OK);
    }

    public function purchase_post($id = null)
    {
        if (! $this->checkToken()) {
            $this->response(
                [
                    'result'  => 'Error',
                    'message' => 'user is not authorised',
                ],
                REST_Controller::HTTP_BAD_REQUEST
            );
            return;
        }
        $post_data = $this->post();

        // pinvoice table data
        $pinvoice = [
            'CustomerID' => $post_data['CustomerID'],
            'Date'       => $post_data['Date'],
            'DtCr'       => $post_data['DtCr'],
            'InvoiceNo'  => isset($post_data['InvoiceNo']) ? $post_data['InvoiceNo'] : null,
            'VehicleNo'  => isset($post_data['VehicleNo']) ? $post_data['VehicleNo'] : null,
            'CofNo'      => isset($post_data['CofNo']) ? $post_data['CofNo'] : null,
            'ReceiptNo'  => isset($post_data['ReceiptNo']) ? $post_data['ReceiptNo'] : null,
            'BuiltyNo'   => isset($post_data['BuiltyNo']) ? $post_data['BuiltyNo'] : null,
            'SupplierID' => isset($post_data['SupplierID']) ? $post_data['SupplierID'] : null,
            'Amount'     => isset($post_data['Amount']) ? $post_data['Amount'] : null,
            'Carriage'   => isset($post_data['Carriage']) ? $post_data['Carriage'] : null,
            'ClosingID'  => isset($post_data['ClosingID']) ? $post_data['ClosingID'] : null,
        ];

        if (! $this->validateDate($pinvoice['Date'], 'Y-m-d')) {
            $this->response([
                'status'  => false,
                'message' => 'Invalid Date Format'], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        $this->db->trans_begin();
        if ($id == null) {

            $this->db->set($pinvoice);
            $this->db->insert('pinvoices', $pinvoice);
            $invID = $this->db->insert_id();
        } else {
            $this->db->where('InvoiceID', $id);
            $this->db->update('pinvoices', $pinvoice);
            $this->db->query("DELETE FROM `pinvoicedetails` WHERE `InvoiceID`=" . $id);
            $invID = $id;
        }

        $details = $post_data['details'];

        foreach ($details as $value) {
            $pdetails['InvoiceID'] = $invID;
            $pdetails['ProductID'] = $value['ProductID'];
            $pdetails['Qty']       = $value['Qty'];
            $pdetails['Packing']   = $value['Packing'];
            $pdetails['PPrice']    = $value['Price'];
            $pdetails['DiscRatio'] = isset($value['DiscRatio']) ? $value['DiscRatio'] : 0;
            $this->db->insert('pinvoicedetails', $pdetails);
        }

        $this->db->trans_commit();
        $this->response(['id' => $invID], REST_Controller::HTTP_OK);

        // $this->PostPurchases();
    }

    public function transfer_post($id = null)
    {
        $post_data = $this->post();

        // transfer table data
        $transfer['ToStore']    = $post_data['ToStore'];
        $transfer['FromStore']  = $post_data['FromStore'];
        $transfer['Date']       = $post_data['Date'];
        $transfer['ClosingID']  = $post_data['ClosingID'];
        $transfer['BusinessID'] = $post_data['BusinessID'];
        $transfer['CustomerID'] = $post_data['CustomerID'];
        $transfer['UserID']     = $post_data['UserID'];
        $transfer['Time']       = $post_data['Time'];
        $transfer['Notes']      = $post_data['Notes'];

        $details = $post_data['details'];
        $this->db->trans_begin();

        if ($id == null) {
            $this->db->insert('stocktransfer', $transfer);
            $transferID = $this->db->insert_id();
        } else {
            $this->db->where('TransferID', $id);
            $this->db->update('stocktransfer', $transfer);
            $this->db->query("DELETE FROM `transferdetails` WHERE `TransferID`=" . $id);
            $transferID = $id;
        }

        $detdata = [];
        foreach ($details as $value) {
            $detdata['TransferID'] = $transferID;
            $detdata['StockID']    = $value['StockID'];
            $detdata['ProductID']  = $value['ProductID'];
            $detdata['Qty']        = $value['Qty'];
            $detdata['Packing']    = $value['Packing'];
            $detdata['KGs']        = $value['KGs'];
            $detdata['BusinessID'] = $value['BusinessID'];
            $this->db->insert('transferdetails', $detdata);
        }
        $this->db->trans_commit();
        $this->response(['id' => $this->db->insert_id()], REST_Controller::HTTP_OK);
    }

    private function PostStockTranfer($id = 0, $bid = 0)
    {

        if ($id > 0) {
            $this->db->where('TransferID', $id);
        } else {
            $this->db->where('BusinessID', $bid);
        }
        $this->db->where('IsPosted', 0);
        $this->db->where("Date <> '0000-00-00'");

        $InvoiceRes = $this->db->get('stocktransfer')->result_array();
        $this->db->trans_begin();
        foreach ($InvoiceRes as $InvoiceValue) {
            $this->db->where('TransferID', $InvoiceValue['TransferID']);
            $InvoiceDetailsRes = $this->db->get('qrytransferdetails')->result_array();
            // var_dump($InvoiceDetailsRes);
            foreach ($InvoiceDetailsRes as $InvoiceDetailsvalue) {
                $this->UpdateStock(
                    2,
                    'Stock Transfer',
                    $InvoiceDetailsvalue['ProductID'],
                    0,
                    $InvoiceDetailsvalue['Qty'] * $InvoiceDetailsvalue['Packing'] +
                    $InvoiceDetailsvalue['KGs'],
                    0,
                    $InvoiceValue['TransferID'],
                    4,
                    $InvoiceValue['Date'],
                    $InvoiceValue['FromStore'],
                    $InvoiceDetailsvalue['UnitID'],
                    $InvoiceValue['BusinessID']
                );
                // var_dump('in return ');
                $this->UpdateStock(
                    1,
                    'Stock Received',
                    $InvoiceDetailsvalue['ProductID'],
                    0,
                    0,
                    $InvoiceDetailsvalue['Qty'] * $InvoiceDetailsvalue['Packing']
                     + $InvoiceDetailsvalue['KGs'],
                    $InvoiceValue['TransferID'],
                    4,
                    $InvoiceValue['Date'],
                    $InvoiceValue['ToStore'],
                    $InvoiceDetailsvalue['UnitID'],
                    $InvoiceValue['BusinessID']
                );
            }
            $posted['IsPosted'] = '1';
            $this->db->where('TransferID', $InvoiceValue['TransferID']);
            $this->db->update('stocktransfer', $posted);
        }
        $this->db->trans_commit();
    }
    public function poststransfer_post($id)
    {
        $this->PostStockTranfer($id);
        $this->response(['Transfer Posted' => $id], REST_Controller::HTTP_OK);
    }

    public function order_post($id = null)
    {
        $post_data = $this->post();

        $this->db->trans_begin();

        foreach ($post_data as $value) {
            $data['CustomerID'] = $value['CustomerID'];
            $data['SalesmanID'] = $value['SalesmanID'];
            $data['RouteID']    = $value['RouteID'];
            $data['ProductID']  = $value['ProductID'];
            $data['Qty']        = $value['Qty'];
            $data['Packing']    = $value['Packing'];
            $data['Pcs']        = $value['Pcs'];
            $data['Bonus']      = $value['Bonus'];
            $data['SPrice']     = $value['SPrice'];
            $data['PPrice']     = $value['PPrice'];
            $data['StockID']    = $value['StockID'];
            $data['DiscRatio']  = $value['DiscRatio'];
            $data['BusinessID'] = $value['BusinessID'];
            // $data['GSTRatio']       = $value['GSTRatio']         ;
            $data['SchemeRatio'] = $value['SchemeRatio'];
            // $data['RateDisc']       = $value['RateDisc']         ;
            // $data['Remarks'] = $value['Remarks']  ;
            $data['Date'] = $value['Date'];

            $this->db->insert('orders', $data);
        }

        $this->db->trans_commit();
        $this->response(['id' => $this->db->insert_id()], REST_Controller::HTTP_OK);
    }

    public function validateDate($date, $format = 'Y-m-d')
    {
        return DateTime::createFromFormat($format, $date) == true;
    }

    public function pendinginvoice_post($id = null)
    {
        $post_data = $this->post();

        // pinvoice table data
        $invoice['CustomerID'] = $post_data['CustomerID'];
        $invoice['Date']       = $post_data['Date'];
        $invoice['Time']       = $post_data['Time'];
        $invoice['Type']       = $post_data['Type'];
        $invoice['IsPosted']   = $post_data['IsPosted'];
        $invoice['DtCr']       = $post_data['DtCr'];
        $invoice['UserID']     = $post_data['UserID'];
        $invoice['Notes']      = $post_data['Notes'];
        $invoice['BusinessID'] = $post_data['BusinessID'];
        $invoice['ClosingID']  = $post_data['ClosingID'];

        if (! $this->validateDate($invoice['Date'], 'Y-m-d')) {
            $this->db->where('ClosingID', $invoice['ClosingID']);
            $cl = $this->db->get('closing')->result_array();
            if (count($cl) > 0) {
                $invoice['Date'] = $cl[0]['Date'];
            }
        }

        $this->db->trans_begin();
        if ($id == null) {

            $this->db->insert('pending', $invoice);

            $invID   = $this->db->insert_id();
            $details = $post_data['details'];
        } else {
            $this->db->where('InvoiceID', $id);
            $this->db->update('pending', $invoice);
            $invID   = $id;
            $details = $post_data['details'];
            $this->db->query("DELETE FROM `pendingdetails` WHERE `InvoiceID`=" . $id);
        }
        foreach ($details as $value) {
            $dData = [
                'InvoiceID'  => $invID,
                'ProductID'  => $value['ProductID'],
                'StoreID'    => $value['StoreID'],
                'Packing'    => $value['Packing'],
                'Qty'        => $value['Qty'],
                'KGs'        => $value['KGs'],
                'BusinessID' => $value['BusinessID'],
            ];
            $this->db->insert('pendingdetails', $dData);
        }

        $this->db->trans_commit();
        $this->response(['id' => $invID], REST_Controller::HTTP_OK);

        // $this->PostSales();
    }
    public function sale_post($id = null)
    {
        $post_data = $this->post();

        // pinvoice table data
        $invoice['CustomerID']      = $post_data['CustomerID'];
        $invoice['Date']            = $post_data['Date'];
        $invoice['Time']            = $post_data['Time'];
        $invoice['Amount']          = $post_data['Amount'];
        $invoice['Discount']        = $post_data['Discount'];
        $invoice['DeliveryCharges'] = $post_data['DeliveryCharges'];
        $invoice['PackingCharges']  = $post_data['PackingCharges'];
        $invoice['Labour']          = $post_data['Labour'];
        $invoice['AmntRecvd']       = $post_data['AmntRecvd'];
        $invoice['Type']            = $post_data['Type'];
        $invoice['IsPosted']        = $post_data['IsPosted'];
        $invoice['DtCr']            = $post_data['DtCr'];
        $invoice['UserID']          = $post_data['UserID'];
        $invoice['Notes']           = $post_data['Notes'];
        $invoice['BusinessID']      = $post_data['BusinessID'];
        $invoice['ClosingID']       = $post_data['ClosingID'];
        $invoice['CustName']        = $post_data['CustName'];
        $invoice['PrevBalance']     = $post_data['PrevBalance'];

        if (! $this->validateDate($invoice['Date'], 'Y-m-d')) {
            $this->response([
                'status'  => false,
                'message' => 'Invalid Date Format'], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        $this->db->trans_begin();
        if ($id == null) {

            $maxInvoiceID         = $this->utilities->getBillNo($this->db, $invoice['BusinessID'], 1, $invoice['Date']) + 1;
            $invoice['InvoiceID'] = $maxInvoiceID;

            $this->db->insert('invoices', $invoice);

            $invID   = $maxInvoiceID;
            $details = $post_data['details'];
        } else {
            $this->db->where('InvoiceID', $id);
            $this->db->update('invoices', $invoice);
            $invID   = $id;
            $details = $post_data['details'];
            $this->db->query("DELETE FROM `invoicedetails` WHERE `InvoiceID`=" . $id);
        }
        foreach ($details as $value) {
            $dData = [
                'InvoiceID'  => $invID,
                'ProductID'  => $value['ProductID'],
                'StoreID'    => $value['StoreID'],
                'Packing'    => $value['Packing'],
                'Qty'        => $value['Qty'],
                'KGs'        => $value['KGs'],
                'Labour'     => $value['Labour'],
                'Pending'    => $value['Pending'],
                'UnitValue'  => $value['UnitValue'],
                'SPrice'     => $value['SPrice'],
                'PPrice'     => $value['PPrice'],
                'BusinessID' => $value['BusinessID'],
            ];
            $this->db->insert('invoicedetails', $dData);
        }

        $this->db->trans_commit();

        // $this->PostSales($invID);

        $this->response(['id' => $invID], REST_Controller::HTTP_OK);

        // $this->PostSales();
    }
    public function vouchers_post($id = 0)
    {
        $data = $this->post();
        // $date['Date'] = date('Y-m-d');
        $vouch = [
            'Date'        => $data['Date'],
            'CustomerID'  => $data['CustomerID'],
            'Description' => $data['Description'],
            'Debit'       => $data['Debit'],
            'Credit'      => $data['Credit'],
            'RefID'       => $data['RefID'],
            'IsPosted'    => $data['IsPosted'],
            'FinYearID'   => $data['FinYearID'],
            'RefType'     => $data['RefType'],

            'BusinessID'  => $data['BusinessID'],
        ];
        if (! $this->validateDate($vouch['Date'], 'Y-m-d')) {
            $this->response([
                'status'  => false,
                'message' => 'Invalid Date Format'], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        if ($id != 0) {
            $this->db->where('VoucherID', $id);
            $this->db->update('vouchers', $vouch);
        } else {

            $this->db->reset_query();

            $maxInvoiceID = $this->utilities->getBillNo($this->db, $vouch['BusinessID'], 3, $vouch['Date']) + 1;

            $vouch['VoucherID'] = $maxInvoiceID;
            $this->db->insert('vouchers', $vouch);
            $id = $maxInvoiceID;
        }
        $this->response(['id' => $id], REST_Controller::HTTP_OK);
    }
    public function grouprights_post($id = null)
    {
        $this->db->trans_begin();
        $post_data = $this->post();

        foreach ($post_data['data'] as $value) {
            $this->db->insert(
                'usergrouprights',
                [
                    'BusinessID' => $post_data['BusinessID'],
                    'GroupID'    => $post_data['GroupID'],
                    'pageid'     => $value,
                ]
            );
        }
        $this->db->trans_commit();
        $this->response(['msg' => 'Data saved'], REST_Controller::HTTP_OK);
    }
    public function addrecovery_post()
    {
        try {

            $data = $this->post();
            // $date['Date'] = date('Y-m-d');
            foreach ($data['Data'] as $r) {
                if ($r['Recovery'] > 0) {
                    $this->db->insert(
                        'vouchers',
                        [
                            'Date'        => $data['Date'],
                            'CustomerID'  => $r['CustomerID'],
                            'Description' => 'Cash Recvd',
                            'Debit'       => 0,
                            'Credit'      => $r['Recovery'],
                            'RefID'       => 0,
                            'IsPosted'    => 0,
                            'FinYearID'   => 0,
                            'RefType'     => 0,
                            'SalesmanID'  => $data['SalesmanID'],
                            'RouteID'     => $data['RouteID'],
                            'ClosingID'   => $data['ClosingID'],
                            'BusinessID'  => $data['BusinessID'],
                        ]
                    );
                }
            }
            $this->response(['msg' => 'Saved'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['Error' => 'Error while saving'], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function payinvoice_post()
    {
        $data = $this->post();

        $this->db->query('Update invoices set AmountRecvd = AmountRecvd + ' . $data['Amount'] . ' Where InvoiceID = ' . $data['InvoiceID']);

        $this->response(['msg' => 'Invoice Paid'], REST_Controller::HTTP_OK);
    }
    public function makereturn_post()
    {
        $data = $this->post();
        $this->db->trans_begin();

        $this->db->query("INSERT INTO invoices (InvoiceID, Date, CustomerID, Amount, Discount, ExtraDisc, Scheme, PrevBalance, AmountRecvd, DtCr, SessionID, Type, Notes, IsPosted, FinYearID, Printed, SalesmanID, BusinessID, UserID, RouteID ) select 0, Date , CustomerID, Amount, Discount, ExtraDisc, Scheme, PrevBalance, AmountRecvd, 'DT', SessionID, Type, Notes, 0, FinYearID, Printed, SalesmanID, BusinessID, UserID, RouteID from invoices where InvoiceID = " . $data['InvoiceID']);
        $ID = $this->db->insert_id();
        $this->db->query("INSERT INTO invoicedetails(  InvoiceID, ProductID, Qty, Pcs, Packing, SPrice, PPrice, StockID, StoreID, DiscRatio, GSTRatio, SchemeRatio, Bonus, Discount, RateDisc, Remarks, BusinessID) select   $ID, ProductID, Qty, Pcs, Packing, SPrice, PPrice, StockID, StoreID, DiscRatio, GSTRatio, SchemeRatio, Bonus, Discount, RateDisc, Remarks, BusinessID from invoicedetails where InvoiceID = " . $data['InvoiceID']);
        $this->db->trans_commit();
        $this->response(['id' => $ID], REST_Controller::HTTP_OK);
    }

    public function postvouchers_post($id)
    {
        $this->PostVouchers($id);
    }

    // Public endpoint to post a single transport detail by ID (set IsPosted = 1)
    public function posttransport_post($id = 0)
    {
        try {
            $id = intval($id);
            if ($id <= 0) {
                $this->response(['status' => false, 'message' => 'Invalid Transport Detail ID'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }
            $this->db->where('ID', $id);
            $this->db->where('IsPosted', 0);
            $this->db->update('transportdetails', ['IsPosted' => 1]);
            $this->response(['msg' => 'Transport detail posted'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['status' => false, 'message' => $e->getMessage()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Public endpoint to unpost transport detail (set IsPosted = 0)
    public function unposttransport_post($id = 0)
    {
        try {
            $id = intval($id);
            if ($id <= 0) {
                $this->response(['status' => false, 'message' => 'Invalid Transport Detail ID'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }
            $this->db->where('ID', $id);
            $this->db->where('IsPosted', 1);
            $this->db->update('transportdetails', ['IsPosted' => 0]);

            // Check for database errors
            $dberr = $this->db->error();
            if (isset($dberr['code']) && $dberr['code'] != 0) {
                // Return DB error details to help local debugging
                $this->response(['status' => false, 'message' => 'Database error during unpost', 'db_error' => $dberr], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }

            // If no rows were affected, inform caller (possibly already unposted or ID not found)
            if ($this->db->affected_rows() === 0) {
                $this->response(['status' => false, 'message' => 'No posted transport record found for given ID'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }

            $this->response(['msg' => 'Transport detail unposted'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['status' => false, 'message' => $e->getMessage()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    

    // Public endpoint to unpost vouchers (set IsPosted = 0)
    public function unpostvouchers_post($id = 0)
    {
        try {
            $id = intval($id);
            if ($id <= 0) {
                $this->response(['status' => false, 'message' => 'Invalid Voucher ID'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }
            $this->db->where('VoucherID', $id);
            $this->db->where('IsPosted', 1);
            $this->db->update('vouchers', ['IsPosted' => 0]);
            $this->response(['msg' => 'Voucher unposted'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['status' => false, 'message' => $e->getMessage()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function PostVouchers($id = 0, $bid = 0)
    {
        if ($id > 0) {
            $this->db->where('VoucherID', $id);
        } else {
            $this->db->where('BusinessID', $bid);
        }
        $this->db->where('IsPosted', 0);

        $this->db->where("Date <> '0000-00-00'");
        $InvoiceRes = $this->db->get('vouchers')->result_array();

        $this->db->trans_begin();
        foreach ($InvoiceRes as $InvoiceValue) {
            $data['CustomerID']  = $InvoiceValue['CustomerID'];
            $data['Date']        = $InvoiceValue['Date'];
            $data['Credit']      = $InvoiceValue['Credit'];
            $data['Debit']       = $InvoiceValue['Debit'];
            $data['Description'] = $InvoiceValue['Description'];
            $data['RefID']       = $InvoiceValue['VoucherID'];
            $data['RefType']     = 2;

            // $data['BusinessID'] = $InvoiceValue['BusinessID'];

            $this->AddToAccount($data);

            $posted['IsPosted'] = '1';
            $this->db->where('VoucherID', $InvoiceValue['VoucherID']);
            $this->db->update('vouchers', $posted);
        }
        $this->db->trans_commit();
    }

    public function UpdateStock(
        $a,
        $desc,
        $pid,
        $pprice,
        $qtyout,
        $qtyin,
        $billNo,
        $bType,
        $invDate,
        $storeID,
        $unitID,
        $bid = 1
    ) {
        try {
            if ($a == 1) {
                $this->db->where('ProductID', $pid);
                $this->db->where('BusinessID', $bid);
                $this->db->where('StoreID', $storeID);

                $stock1 = $this->db->get('stock')->result_array();
                if (count($stock1) > 0) {
                    $stock['Stock'] = $stock1[0]['Stock'] - $qtyout + $qtyin;
                    $this->db->where('StockID', $stock1[0]['StockID']);
                    $this->db->update('stock', $stock);
                } else {
                    $stock['ProductID']  = $pid;
                    $stock['PPrice']     = $pprice;
                    $stock['StoreID']    = $storeID;
                    $stock['BusinessID'] = $bid;
                    $stock['UnitID']     = $unitID;
                    $stock['Stock']      = $qtyin - $qtyout;
                    $this->db->insert('stock', $stock);
                }
            } else {
                // var_dump($qtyin, $qtyout);
                $this->db->where('ProductID', $pid);
                $this->db->where('StoreID', $storeID);
                $this->db->where('BusinessID', $bid);

                $stock1 = $this->db->get('stock')->result_array();

                if (count($stock1) > 0) {
                    $stock['Stock'] = $stock1[0]['Stock'] - $qtyout + $qtyin;
                    $this->db->where('StockID', $stock1[0]['StockID']);
                    $this->db->update('stock', $stock);
                    $pid = $stock1[0]['ProductID'];
                } else {
                    throw (new Exception('Product Not found in Stock'));
                    //exit(0);
                }
            }

            $stockacct['Date']        = $invDate;
            $stockacct['Description'] = $desc;
            $stockacct['ProductID']   = $pid;
            $stockacct['QtyIn']       = $qtyin;
            $stockacct['QtyOut']      = $qtyout;
            $stockacct['Balance']     = $stock['Stock'];
            $stockacct['BusinessID']  = $bid;
            $stockacct['StoreID']     = $storeID;
            $stockacct['RefID']       = $billNo;
            $stockacct['RefType']     = $bType;

            $this->db->insert('stockaccts', $stockacct);
        } catch (Exception $e) {
            throw $e;
        }
    }
    public function postsales_post($InvoiceID)
    {
        $this->PostSales($InvoiceID);
        $this->response(['msg' => 'Invoice Post'], REST_Controller::HTTP_OK);
    }
    public function postpurchases_post($InvoiceID)
    {
        $this->PostPurchases($InvoiceID);
        $this->response(['msg' => 'Invoice Post'], REST_Controller::HTTP_OK);
    }
    public function delete_post()
    {
        $post_data = $this->post();
        $this->db->trans_begin();
        if ($post_data['Table'] === 'S') {
            $this->db->query('delete from invoices where InvoiceID=' . $post_data['ID']);
            $this->db->query('delete from invoicedetails where InvoiceID=' . $post_data['ID']);
        } elseif ($post_data['Table'] === 'V') {
            $this->db->query('delete from vouchers where VoucherID =' . $post_data['ID']);
        } elseif ($post_data['Table'] === 'P') {
            $this->db->query('delete from pinvoices where InvoiceID=' . $post_data['ID']);
            $this->db->query('delete from pinvoicedetails where InvoiceID=' . $post_data['ID']);
        }
        $this->db->trans_commit();
        $this->response(['msg' => 'Ok'], REST_Controller::HTTP_OK);
    }
    public function CloseAccount_post($bid)
    {
        $post_data = $this->post();
        try {

            $this->PostBookings(0);
            $this->PostVouchers(0, $bid);
            $this->PostExpense(0);

            // echo 'vouchers posted';

            $data1['Status']        = '1';
            $data1['ClosingAmount'] = $post_data['ClosingAmount'];
            $this->db->where('ClosingID', $post_data['ClosingID']);
            $this->db->update('closing', $data1);

            $this->response(['msg' => 'Account Closed'], REST_Controller::HTTP_OK);
        } catch (\Exception $e) {
            die($e->getMessage());
        }
        // $this->db->trans_begin();
        // Sale
        // $this->db->trans_commit();
    }
    private function PostSales($id = 0, $bid = 0)
    {
        if ($id > 0) {
            $this->db->where('InvoiceID', $id);
        } else {
            $this->db->where('BusinessID', $bid);
        }
        $this->db->where('IsPosted', 0);
        $this->db->where("Date <> '0000-00-00'");

        $InvoiceRes = $this->db->get('qryinvoices')->result_array();
        $this->db->trans_begin();
        if (count($InvoiceRes) > 0) {
            foreach ($InvoiceRes as $InvoiceValue) {
                $this->db->where('InvoiceID', $InvoiceValue['InvoiceID']);
                $InvoiceDetailsRes = $this->db->get('qryinvoicedetails')->result_array();

                if ($InvoiceValue['DtCr'] == 'CR') { // sale

                    // var_dump($InvoiceValue['NetAmount'], $InvoiceValue['AmountRecvd']);
                    $data['CustomerID']  = $InvoiceValue['CustomerID'];
                    $data['Date']        = $InvoiceValue['Date'];
                    $data['Credit']      = 0;
                    $data['Debit']       = $InvoiceValue['NetAmount'];
                    $data['Description'] = 'Bill No ' . $InvoiceValue['InvoiceID'];
                    $data['Notes']       = $InvoiceValue['Notes'];
                    $data['RefID']       = $InvoiceValue['InvoiceID'];
                    $data['RefType']     = 1;
                    $data['BusinessID']  = $InvoiceValue['BusinessID'];

                    $this->AddToAccount($data);
                    if ($InvoiceValue['AmntRecvd'] > 0) {
                        $data['CustomerID']  = $InvoiceValue['CustomerID'];
                        $data['Date']        = $InvoiceValue['Date'];
                        $data['Credit']      = $InvoiceValue['AmntRecvd'];
                        $data['Debit']       = 0;
                        $data['Description'] = 'Cash Recvd Bill No ' . $InvoiceValue['InvoiceID'];
                        $data['RefID']       = $InvoiceValue['InvoiceID'];
                        $data['RefType']     = 1;
                        $data['BusinessID']  = $InvoiceValue['BusinessID'];
                        $this->AddToAccount($data);
                    }

                    // var_dump($InvoiceDetailsRes);
                    foreach ($InvoiceDetailsRes as $InvoiceDetailsvalue) {
                        $this->UpdateStock(
                            2,
                            'Sale Bill # ' . $InvoiceValue['InvoiceID'],
                            $InvoiceDetailsvalue['ProductID'],
                            $InvoiceDetailsvalue['PPrice'],
                            $InvoiceDetailsvalue['TotKGs'],
                            0,
                            $InvoiceValue['InvoiceID'],
                            '2',
                            $InvoiceValue['Date'],
                            $InvoiceDetailsvalue['StoreID'],
                            $InvoiceDetailsvalue['UnitID'],
                            $InvoiceValue['BusinessID']
                        );
                    }
                } else { // sale return
                    $data['CustomerID']  = $InvoiceValue['CustomerID'];
                    $data['Date']        = $InvoiceValue['Date'];
                    $data['Credit']      = $InvoiceValue['NetAmount'];
                    $data['Debit']       = 0;
                    $data['Description'] = 'Bill No ' . $InvoiceValue['InvoiceID'];
                    $data['RefID']       = $InvoiceValue['InvoiceID'];
                    $data['RefType']     = 1;
                    $data['BusinessID']  = $InvoiceValue['BusinessID'];

                    $this->AddToAccount($data);
                    if ($InvoiceValue['AmntRecvd'] > 0) {
                        $data['CustomerID']  = $InvoiceValue['CustomerID'];
                        $data['Date']        = $InvoiceValue['Date'];
                        $data['Credit']      = 0;
                        $data['Debit']       = $InvoiceValue['AmntRecvd'];
                        $data['Description'] = 'Cash Return Bill No ' . $InvoiceValue['InvoiceID'];
                        $data['RefID']       = $InvoiceValue['InvoiceID'];
                        $data['RefType']     = 1;
                        $data['BusinessID']  = $InvoiceValue['BusinessID'];
                        $this->AddToAccount($data);
                    } // sale return
                    foreach ($InvoiceDetailsRes as $InvoiceDetailsvalue) {
                        // var_dump('in return ');
                        $this->UpdateStock(
                            2,
                            'Sale Return Bill # ' . $InvoiceValue['InvoiceID'],
                            $InvoiceDetailsvalue['ProductID'],
                            $InvoiceDetailsvalue['PPrice'],
                            0,
                            $InvoiceDetailsvalue['TotKGs'],
                            $InvoiceValue['InvoiceID'],
                            '2',
                            $InvoiceValue['Date'],
                            $InvoiceDetailsvalue['StoreID'],
                            $InvoiceDetailsvalue['UnitID'],
                            $InvoiceValue['BusinessID']
                        );
                    }
                }
                $posted['IsPosted'] = '1';
                $this->db->where('InvoiceID', $InvoiceValue['InvoiceID']);
                $this->db->update('invoices', $posted);
            }
        }
        $this->db->trans_commit();
    }

    private function PostPurchases($id = 0, $bid = 0)
    {
        if ($id > 0) {
            $this->db->where('InvoiceID', $id);
        } else {
            $this->db->where('BusinessID', $bid);
        }
        $this->db->where('IsPosted', 0);
        $this->db->where("Date <> '0000-00-00'");
        $PInvoiceRes = $this->db->get('qrypinvoices')->result_array();
        $this->db->trans_begin();
        if (count($PInvoiceRes) > 0) {
            foreach ($PInvoiceRes as $PInvoiceValue) {
                if ($PInvoiceValue['DtCr'] == 'CR') {
                    $data['CustomerID']  = $PInvoiceValue['CustomerID'];
                    $data['Date']        = $PInvoiceValue['Date'];
                    $data['Credit']      = $PInvoiceValue['NetAmount'];
                    $data['Description'] = 'Purchase No ' . $PInvoiceValue['InvoiceID'];
                    $data['RefID']       = $PInvoiceValue['InvoiceID'];
                    $data['RefType']     = 2;
                    $data['Notes']       = $PInvoiceValue['Notes'];

                    $data['BusinessID'] = $PInvoiceValue['BusinessID'];
                    $data['Debit']      = 0;
                    $this->AddToAccount($data);

                    $this->db->where('InvoiceID', $PInvoiceValue['InvoiceID']);
                    $PInvoiceDetailsRes = $this->db->get('qrypinvoicedetails')->result_array();

                    foreach ($PInvoiceDetailsRes as $PInvoiceDetailsvalue) {
                        $this->UpdateStock(
                            1,
                            'Purchase',
                            $PInvoiceDetailsvalue['ProductID'],
                            $PInvoiceDetailsvalue['PPrice'],
                            0,
                            ($PInvoiceDetailsvalue['Qty'] * $PInvoiceDetailsvalue['Packing'] +
                                $PInvoiceDetailsvalue['KGs']),
                            $PInvoiceValue['InvoiceID'],
                            1,
                            $PInvoiceValue['Date'],
                            $PInvoiceDetailsvalue['StoreID'],
                            $PInvoiceDetailsvalue['UnitID'],
                            $PInvoiceValue['BusinessID']
                        );
                    }
                } else {
                    $data['CustomerID']  = $PInvoiceValue['CustomerID'];
                    $data['Date']        = $PInvoiceValue['Date'];
                    $data['Credit']      = 0;
                    $data['Description'] = 'P/Return Bill No ' . $PInvoiceValue['InvoiceID'];
                    $data['RefID']       = $PInvoiceValue['InvoiceID'];
                    $data['RefType']     = 2;

                    $data['BusinessID'] = 0;
                    $data['Debit']      = $PInvoiceValue['NetAmount'];
                    $this->AddToAccount($data);

                    $this->db->where('InvoiceID', $PInvoiceValue['InvoiceID']);
                    $PInvoiceDetailsRes = $this->db->get('qrypinvoicedetails')->result_array();

                    foreach ($PInvoiceDetailsRes as $PInvoiceDetailsvalue) {
                        $this->UpdateStock(
                            2,
                            'Purchase',
                            $PInvoiceDetailsvalue['ProductID'],
                            $PInvoiceDetailsvalue['PPrice'],

                            ($PInvoiceDetailsvalue['Qty'] * $PInvoiceDetailsvalue['Packing'] +
                                $PInvoiceDetailsvalue['KGs']),
                            0,
                            $PInvoiceValue['InvoiceID'],
                            1,
                            $PInvoiceValue['Date'],
                            $PInvoiceDetailsvalue['StoreID'],
                            $PInvoiceDetailsvalue['UnitID'],
                            $PInvoiceValue['BusinessID']
                        );
                    }
                }

                $posted['IsPosted'] = '1';
                $this->db->where($this->getpkey('pinvoices'), $PInvoiceValue['InvoiceID']);
                $this->db->update('pinvoices', $posted);
            }
        }
        $this->db->trans_commit();
    }

    public function addtosupl_post()
    {
        try {
            $post_data = $this->post();
            if (!isset($post_data['CustomerID'])) {
                $this->response(['status' => false, 'msg' => 'CustomerID is required'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }
            $this->AddToAccount($post_data);
            $this->response(['status' => true, 'msg' => 'Saved'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['status' => false, 'msg' => 'Error: ' . $e->getMessage()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function AddToAccount($data)
    {
        $this->db->where('CustomerID', $data['CustomerID']);
        $custRes = $this->db->get('customers')->result_array();
        if (!isset($custRes[0])) {
            throw new Exception('Customer not found');
        }
        $cust = $custRes[0];
        $debit = isset($data['Debit']) ? floatval($data['Debit']) : 0.0;
        $credit = isset($data['Credit']) ? floatval($data['Credit']) : 0.0;
        $newBal = floatval($cust['Balance']) + $debit - $credit;

        // Map incoming fields to actual customeraccts columns (avoid unknown columns like BusinessID)
        $insert = [];
        $insert['CustomerID'] = $cust['CustomerID'];
        $insert['Date'] = isset($data['Date']) ? $data['Date'] : date('Y-m-d');
        $insert['Description'] = isset($data['Description']) ? $data['Description'] : '';
        // Map RefID to InvoiceID where applicable
        $insert['InvoiceID'] = isset($data['RefID']) ? $data['RefID'] : 0;
        // Determine debit/credit column names in customeraccts
        if ($this->db->field_exists('Amount', 'customeraccts')) {
            $insert['Amount'] = $debit;
        } elseif ($this->db->field_exists('Debit', 'customeraccts')) {
            $insert['Debit'] = $debit;
        }
        if ($this->db->field_exists('Recived', 'customeraccts')) {
            $insert['Recived'] = $credit;
        } elseif ($this->db->field_exists('Credit', 'customeraccts')) {
            $insert['Credit'] = $credit;
        }
        $insert['Balance'] = $newBal;

        $this->db->insert('customeraccts', $insert);
        $cust['Balance'] = $newBal;
        $this->db->where('CustomerID', $cust['CustomerID']);
        $this->db->update('customers', $cust);
    }

    public function updateload_post($loadno)
    {
        $post_data = $this->post();
        $ids       = $post_data['invids'];
        $date      = $post_data['date'];

        $this->db->query("update invoices set LoadNo = 0 where LoadNo = $loadno and Date ='$date'");
        $qry = "update invoices set LoadNo =$loadno where InvoiceID In ($ids)";
        $this->db->query($qry);
        $this->response(['msg' => 'Bills updated'], REST_Controller::HTTP_OK);
    }
    public function getpkey($table)
    {
        $fields = $this->db->field_data($table);

        foreach ($fields as $field) {
            if ($field->primary_key) {
                return $field->name;
            }
        }
        return "";
    }
    public function getAuthorizationHeader()
    {
        $headers = $this->input->request_headers();
        if (array_key_exists('Authorization', $headers) && ! empty($headers['Authorization'])) {
            return $headers['Authorization'];
        } else {
            return null;
        }
    }

    /**
     *
     * get access token from header
     * */
    public function getBearerToken()
    {
        $headers = $this->getAuthorizationHeader();
        // HEADER: Get the access token from the header
        if (! empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                //echo $matches[1];
                return $matches[1];
            }
        }
        return null;
    }
    public function checkToken()
    {

        $token = $this->getBearerToken();
        if ($token) {
            $decode       = jwt::decode($token, $this->config->item('api_key'), ['HS256']);
            $this->userID = $decode->id;
            return true;
        }
        return false;
    }

    public function booking_post($id = null)
    {
        if (! $this->checkToken()) {
            $this->response(
                [
                    'result'  => 'Error',
                    'message' => 'user is not authorised',
                ],
                REST_Controller::HTTP_BAD_REQUEST
            );
            return;
        }
        $post_data = $this->post();

        // pinvoice table data
        $booking = [
            'SupplierID' => $post_data['SupplierID'],
            'Date'       => $post_data['Date'],
            'DtCr'       => $post_data['DtCr'],
            'InvoiceNo'  => isset($post_data['InvoiceNo']) ? $post_data['InvoiceNo'] : null,
            'VehicleNo'  => isset($post_data['VehicleNo']) ? $post_data['VehicleNo'] : null,
            'CofNo'      => isset($post_data['CofNo']) ? $post_data['CofNo'] : null,
            'ReceiptNo'  => isset($post_data['ReceiptNo']) ? $post_data['ReceiptNo'] : null,
            'BuiltyNo'   => isset($post_data['BuiltyNo']) ? $post_data['BuiltyNo'] : null,
            'Amount'     => isset($post_data['Amount']) ? $post_data['Amount'] : null,
            'Carriage'   => isset($post_data['Carriage']) ? $post_data['Carriage'] : null,
            'ClosingID'  => isset($post_data['ClosingID']) ? $post_data['ClosingID'] : null,
            'IsPosted'   => 0,
        ];

        if (! $this->validateDate($booking['Date'], 'Y-m-d')) {
            $this->response([
                'status'  => false,
                'message' => 'Invalid Date Format'], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        $this->db->trans_begin();
        if ($id == null) {

            $this->db->insert('booking', $booking);
            $invID = $this->db->insert_id();
        } else {
            $this->db->where('BookingID', $id);
            $this->db->update('booking', $booking);
            $this->db->query("DELETE FROM `booking_details` WHERE `BookingID`=" . $id);
            $invID = $id;
        }

        $details = $post_data['details'];

        foreach ($details as $value) {
            $pdetails['BookingID'] = $invID;
            $pdetails['ProductID'] = $value['ProductID'];
            $pdetails['Qty']       = $value['Qty'];
            $pdetails['Packing']   = $value['Packing'];
            $pdetails['PPrice']    = $value['Price'];
            $pdetails['DiscRatio'] = isset($value['DiscRatio']) ? $value['DiscRatio'] : 0;
            $pdetails['Type']      = 1; //--Purchase

            $this->db->insert('booking_details', $pdetails);
        }
        $sales = $post_data['sales'];
        $orderIDs = [];

        foreach ($sales as $value) {
            $pdetails['BookingID']  = $invID;
            $pdetails['ProductID']  = $value['ProductID'];
            $pdetails['CustomerID'] = $value['CustomerID'];
            $pdetails['OrderID']     = $value['OrderID'];
            $pdetails['Qty']        = $value['Qty'];
            $pdetails['PPrice']     = $value['Price'];
            $pdetails['SPrice']     = $value['Price'];
            $pdetails['Discount']   = isset($value['Discount']) ? $value['Discount'] : 0;
            $pdetails['MRP']        = isset($value['MRP']) ? $value['MRP'] : 0;
            $pdetails['Received']   = isset($value['Received']) ? $value['Received'] : 0;
            $pdetails['Type']       = 2; //--Sale

            $this->db->insert('booking_details', $pdetails);

            if (isset($value['OrderID'])) {
          $orderIDs[] = $value['OrderID'];
            }
        }

        if (!empty($orderIDs)) {
            $this->updateOrderStatus($orderIDs, 'Shipped');
        }

        $this->db->trans_commit();
        $this->response(['id' => $invID], REST_Controller::HTTP_OK);

        // $this->PostPurchases();
    }
    public function postbooking_post($id = 0)
    {
        if (! $this->checkToken()) {
            $this->response(
                [
                    'result'  => 'Error',
                    'message' => 'user is not authorised',
                ],
                REST_Controller::HTTP_BAD_REQUEST
            );
            return;
        }

        $this->PostBookings($id);

        $this->response(['msg' => 'Booking(s) posted'], REST_Controller::HTTP_OK);
    }

    // Public endpoint to unpost a booking (set IsPosted = 0)
    public function unpostbooking_post($id = 0)
    {
        try {
            $id = intval($id);
            if ($id <= 0) {
                $this->response(['status' => false, 'message' => 'Invalid Booking ID'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }
            $this->db->where('BookingID', $id);
            $this->db->where('IsPosted', 1);
            $this->db->update('booking', ['IsPosted' => 0]);
            $this->response(['msg' => 'Booking unposted'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['status' => false, 'message' => $e->getMessage()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function AddToCash($data)
    {

        // Add a new cashbook entry and update balance
        // $data should contain: Date, AcctID, Details, Recvd, Paid, Type
        $acctID = isset($data['AcctID']) ? $data['AcctID'] : 0;

        // Get last balance for this account
        $this->db->order_by('CashID', 'DESC');
        $this->db->where('AcctID', $acctID);
        $last        = $this->db->get('cashbook', 1)->row_array();
        $lastBalance = isset($last['Balance']) ? $last['Balance'] : 0;

        $recvd   = isset($data['Recvd']) ? $data['Recvd'] : 0;
        $paid    = isset($data['Paid']) ? $data['Paid'] : 0;
        $balance = $lastBalance + $recvd - $paid;

        $entry = [
            'Date'    => isset($data['Date']) ? $data['Date'] : date('Y-m-d H:i:s'),
            'AcctID'  => $acctID,
            'Details' => isset($data['Details']) ? $data['Details'] : '',
            'Recvd'   => $recvd,
            'Paid'    => $paid,
            'Balance' => $balance,
            'Type'    => isset($data['Type']) ? $data['Type'] : 0,
        ];

        $this->db->insert('cashbook', $entry);
        return $this->db->insert_id();
    }

    public function transportvoucher_post($id = null)
    {
        if (! $this->checkToken()) {
            $this->response(
                [
                    'result'  => 'Error',
                    'message' => 'user is not authorised',
                ],
                REST_Controller::HTTP_BAD_REQUEST
            );
            return;
        }
        try {
            $post_data = $this->post();

            $this->db->trans_begin();

            $date        = isset($post_data['Date']) ? $post_data['Date'] : date('Y-m-d H:i:s');
            $transportID = isset($post_data['TransportID']) ? $post_data['TransportID'] : 0;
            $details     = isset($post_data['Details']) ? $post_data['Details'] : '';
            $income      = isset($post_data['Income']) ? $post_data['Income'] : 0;
            $expense     = isset($post_data['Expense']) ? $post_data['Expense'] : 0;

            // Get last balance for this TransportID
            $this->db->order_by('ID', 'DESC');
            $this->db->where('TransportID', $transportID);
            $last        = $this->db->get('transportdetails', 1)->row_array();
            $lastBalance = isset($last['Balance']) ? $last['Balance'] : 0;

            // Calculate new balance
            $balance = $lastBalance + $income - $expense;

            // Insert new record
            $data = [
                'Date'        => $date,
                'TransportID' => $transportID,
                'Details'     => $details,
                'Income'      => $income,
                'Expense'     => $expense,
                'Balance'     => $balance,
                'BusinessID'  => isset($post_data['BusinessID']) ? $post_data['BusinessID'] : 0,
                'IsPosted'    => 0,
            ];

            $this->db->insert('transportdetails', $data);
            // Check for DB errors after insert
            $dberr = $this->db->error();
            if (isset($dberr['code']) && $dberr['code'] != 0) {
                $this->db->trans_rollback();
                $this->response([
                    'status'  => false,
                    'message' => 'Database error inserting transport detail',
                    'db_error' => $dberr,
                ], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }

            $id = $this->db->insert_id();

            $this->db->trans_commit();

            $this->response(['id' => $id, 'balance' => $balance], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $this->response(
                [
                    'status'  => false,
                    'message' => 'Error: ' . $e->getMessage(),
                ],
                REST_Controller::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    private function PostBookings($id = 0)
    {
        if ($id > 0) {
            $this->db->where('BookingID', $id);
        }
        $this->db->where('IsPosted', 0);
        $this->db->where("Date <> '0000-00-00'");
        $bookings = $this->db->get('qrybooking')->result_array();

        $this->db->trans_begin();
        foreach ($bookings as $booking) {

            $supplierID = isset($booking['SupplierID']) ? $booking['SupplierID'] : 0;
            if ($supplierID = 0) {
                $this->response([
                    'status' => 'error',
                    'msg'    => 'Supplier not found'], REST_Controller::HTTP_NOT_FOUND);
                return;
            }

            $date = $booking['Date'];
            $this->db->where('BookingID', $booking['BookingID']);
            $details = $this->db->get('qrybookingpurchase')->result_array();

            foreach ($details as $detail) {

                $data['CustomerID'] = $supplierID;
                $data['Date']       = $date;
                $data['InvNo']      = $booking['InvoiceNo'];
                $data['RecNo']      = $booking['ReceiptNo'];
                $data['CofNo']      = $booking['CofNo'];
                $data['BuiltyNo']   = $booking['BuiltyNo'];
                $data['VehicleNo']  = $booking['VehicleNo'];
                $data['Rate']       = $detail['Price'];
                $data['Qty']        = $detail['Qty'];
                $data['Credit']     = $booking['Amount'];
                $data['Debit']      = $booking['Debit'];
                $data['RefID']      = $booking['BookingID'];
                $data['RefType']    = 1;
                $this->AddToAccount($data);

            }
            $this->db->where('BookingID', $booking['BookingID']);
            $details = $this->db->get('qrybookingsale')->result_array();

            foreach ($details as $detail) {
                $accountData = [
                    'CustomerID'  => $detail['CustomerID'],
                    'Date'        => $date,
                    'InvNo'       => $booking['InvoiceNo'],
                    'BuiltyNo'    => $booking['BuiltyNo'],
                    'VehicleNo'   => $booking['VehicleNo'],
                    'Rate'        => $detail['SPrice'],
                    'Qty'         => $detail['Qty'],
                    'Credit'      => 0,
                    'Debit'       => $detail['SPrice'] * $detail['Qty'],
                    'Description' => $detail['ProductName'],
                    'RefID'       => $booking['BookingID'],
                    'RefType'     => 2,
                ];
                $this->AddToAccount($accountData);

                if ($detail['Discount'] > 0) {
                    $accountData = [
                        'CustomerID'  => $detail['CustomerID'],
                        'Date'        => $date,
                        'InvNo'       => $booking['InvoiceNo'],
                        'BuiltyNo'    => $booking['BuiltyNo'],
                        'VehicleNo'   => $booking['VehicleNo'],
                        'Rate'        => 0,
                        'Qty'         => 0,
                        'Credit'      => $detail['Discount'],
                        'Debit'       => 0,
                        'Description' => 'Discount ' . $detail['ProductName'],
                        'RefID'       => $booking['BookingID'],
                        'RefType'     => 2,
                    ];
                    $this->AddToAccount($accountData);
                }

                // if ($detail['Received'] > 0) {
                //     $accountData = [
                //         'CustomerID'  => $detail['CustomerID'],
                //         'Date'        => $date,
                //         'InvNo'       => $booking['InvoiceNo'],
                //         'BuiltyNo'    => $booking['BuiltyNo'],
                //         'VehicleNo'   => $booking['VehicleNo'],
                //         'Rate'        => 0,
                //         'Qty'         => 0,
                //         'Credit'      => $detail['Received'],
                //         'Debit'       => 0,
                //         'Description' => 'Cash Recvd ' . $detail['ProductName'],
                //         'RefID'       => $booking['BookingID'],
                //         'RefType'     => 2,
                //     ];
                //     $this->AddToAccount($accountData);
                //     $cashdata = [
                //         'Date'    => $date,
                //         'AcctID'  => $detail['CustomerID'], // Cash account
                //         'Details' => 'Cash Recvd ' . $detail['ProductName'] . ' Inv#' . $booking['InvoiceNo'],
                //         'Recvd'   => $detail['Received'],
                //         'Paid'    => 0,
                //         'Type'    => 1, // Receipt
                //     ];
                //     $this->AddToCash($cashdata);
                // }

            }

            // Maintain supplier account for purchase

            if ($booking['Carriage'] > 0) {

                // Add carriage charges to cashbook
                $cashdata = [
                    'Date'    => $date,
                    'AcctID'  => 0,
                    'Details' => 'Carriage Charges Inv#' . $booking['BookingID'],
                    'Recvd'   => 0,
                    'Paid'    => $booking['Carriage'],
                    'Type'    => 2, // Payment
                ];
                $this->AddToCash($cashdata);
            }

            $posted['IsPosted'] = 1;
            $this->db->where('BookingID', $booking['BookingID']);
            $this->db->update('booking', $posted);
        }
        $this->db->trans_commit();
    }
    private function PostExpense($id = 0)
    {
        if ($id > 0) {
            $this->db->where('BookingID', $id);
        }
        $this->db->where('IsPosted', 0);
        $this->db->update('expend', ['IsPosted' => 1]);
    }

    // Public wrapper to post a single expense by ID (called via POST /tasks/postexpense/{id})
    public function postexpense_post($id = 0)
    {
        try {
            $id = intval($id);
            if ($id <= 0) {
                $this->response(['status' => false, 'message' => 'Invalid Expense ID'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }
            $this->db->where('ExpendID', $id);
            $this->db->where('IsPosted', 0);
            $this->db->update('expend', ['IsPosted' => 1]);
            $this->response(['msg' => 'Expense posted'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['status' => false, 'message' => $e->getMessage()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Public endpoint to unpost a single expense by ID (called via POST /tasks/unpostexpense/{id})
    public function unpostexpense_post($id = 0)
    {
        try {
            $id = intval($id);
            if ($id <= 0) {
                $this->response(['status' => false, 'message' => 'Invalid Expense ID'], REST_Controller::HTTP_BAD_REQUEST);
                return;
            }
            // NOTE: This will only change the IsPosted flag. Reversing accounting entries is not implemented here.
            $this->db->where('ExpendID', $id);
            $this->db->where('IsPosted', 1);
            $this->db->update('expend', ['IsPosted' => 0]);
            $this->response(['msg' => 'Expense unposted'], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response(['status' => false, 'message' => $e->getMessage()], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function updateOrderStatus($orderIDs, $status)
    {
      if (!is_array($orderIDs) || empty($status)) {
        return false;
      }

      $this->db->where_in('OrderID', $orderIDs);
      return $this->db->update('orders', ['Status' => $status]);
    }

}
