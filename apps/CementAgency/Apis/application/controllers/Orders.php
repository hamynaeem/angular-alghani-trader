<?php
defined('BASEPATH') or exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
/** @noinspection PhpIncludeInspection */
require APPPATH . '/libraries/REST_Controller.php';
require_once APPPATH . '/libraries/JWT.php';

use Restserver\Libraries\REST_Controller;
use \Firebase\JWT\JWT;

class Orders extends REST_Controller
{
    public $userID = 0;
    public function __construct()
    {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        parent::__construct();
        $this->load->database();
    }

    public function checkToken()
    {
        return true;

        $token = $this->getBearerToken();
        //var_dump($token);
        if ($token) {
            try {
                $decode = jwt::decode($token, $this->config->item('api_key'), array('HS256'));
                $this->userID = $decode->id;
            } catch (Exception $e) {
                echo 'Exception catched: ',  $e->getMessage(), "\n";
                return false;
            }

            return true;
        }
        return false;
    }
    public function index_get($date, $customerid)
    {
        // if (!$this->checkToken()) {
        //     $this->response(
        //         array(
        //   'result' => 'Error',
        //   'message' => 'user is not authorised'
        // ),
        //         REST_Controller::HTTP_BAD_REQUEST
        //     );
        //     return;
        // }

        // header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        // header("Cache-Control: post-check=0, pre-check=0", false);
        // header("Pragma: no-cache");

        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        if (!isset($customerid)) {
            $this->response(array('result' => 'Error', 'message' => 'Customer is misssing'), REST_Controller::HTTP_BAD_REQUEST);
            return;
        }


        $this->db->where('Status', 0);
        $this->db->where('CustomerID', $customerid);
        // echo $this->db->get_compiled_select();
        $query = $this->db->get('qryorders');

        if ($query) {
            $this->response($query->result_array(), REST_Controller::HTTP_OK);
        } else {
            $this->response(array('result' => 'Error', 'message' => $this->db->error()), REST_Controller::HTTP_BAD_REQUEST);
        }
    }
    public function invoice_post()
    {

        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        $post_data = $this->post();

        try {
            $this->db->trans_start();
            $data['CustomerID'] = $post_data['CustomerID'];
            $data['Date'] = $post_data['Date'];
            $data['DtCr'] = 'CR';
            $data['Type'] = '1';
            $data['IsPosted'] = '0';
            $data['SalesmanID'] = $post_data['SalesmanID'];
            $data['RouteID'] = $post_data['RouteID'];
            $data['UserID'] = $post_data['UserID'];
            $data['BusinessID'] = $post_data['BusinessID'];
            $data['PrevBalance'] = $post_data['PrevBalance'];


            $this->db->insert('invoices', $data);
            $invID = $this->db->insert_id();

            $qry = "insert into invoicedetails (InvoiceID, ProductID, StockID,  PPrice, SPrice, Qty, Pcs , Packing, Bonus, DiscRatio , SchemeRatio , GSTRatio , Remarks , RateDisc, BusinessID) " ;
            $qry .= " select $invID, ProductID, StockID,  PPrice, SPrice, Qty, Pcs , Packing, Bonus, DiscRatio , SchemeRatio , GSTRatio , Remarks , RateDisc, BusinessID from orders where ";
            $qry .= " Status =0  and   CustomerID=" . $post_data['CustomerID'];

            $this->db->query($qry);
            $this->db->query("call procupdate_inv($invID)");
            $this->db->query("update orders set status = 1 where  CustomerID=" . $post_data['CustomerID']);

            $this->db->trans_complete();
            $this->response(array('id'=>$invID), REST_Controller::HTTP_OK);
        } catch (\Throwable $th) {
            $this->response(array('result' => 'Error', 'message' => $this->db->error()), REST_Controller::HTTP_BAD_REQUEST);
        }
    }
    public function customers_get($date, $routeid=0)
    {
        if (!$this->checkToken()) {
            $this->response(
                array(
          'result' => 'Error',
          'message' => 'user is not authorised'
        ),
                REST_Controller::HTTP_BAD_REQUEST
            );
            return;
        }
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $query = $this->db->query("select CustomerID, CustomerName, Balance from customers where customerid in " .
            " (Select CustomerID from orders where Status = 0) and (RouteID = $routeid or $routeid = 0)");
        if ($query) {
            $this->response($query->result_array(), REST_Controller::HTTP_OK);
        } else {
            $this->response(array('result' => 'Error', 'message' => $this->db->error()), REST_Controller::HTTP_BAD_REQUEST);
        }
    }

    public function index_options()
    {
        if (!$this->checkToken()) {
            $this->response(
                array(
          'result' => 'Error',
          'message' => 'user is not authorised'
        ),
                REST_Controller::HTTP_BAD_REQUEST
            );
            return;
        }
        header('Access-Control-Allow-Headers: X-Requested-With, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers');
        $this->response(null, REST_Controller::HTTP_OK);
    }


    /**
     * Get hearder Authorization
     * */
    public function getAuthorizationHeader()
    {
        $headers = $this->input->request_headers();
        if (array_key_exists('Authorization', $headers) && !empty($headers['Authorization'])) {
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
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                //echo $matches[1];
                return $matches[1];
            }
        }
        return null;
    }
}
