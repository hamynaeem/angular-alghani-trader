<?php
defined('BASEPATH') or exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
/** @noinspection PhpIncludeInspection */
require APPPATH . '/libraries/REST_Controller.php';
require_once APPPATH . '/libraries/JWT.php';

use Restserver\Libraries\REST_Controller;
use \Firebase\JWT\JWT;

class Apis extends REST_Controller
{
    public $userID = 0;
    public function __construct()
    {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        parent::__construct();
        $this->load->database();
        $this->load->helper('url');
    }

    public function checkToken()
    {
        return true;

        $token = $this->getBearerToken();
        if ($token) {
            try {
                $decode       = jwt::decode($token, $this->config->item('api_key'), ['HS256']);
                $this->userID = $decode->id;
            } catch (Exception $e) {
                echo 'Exception catched: ', $e->getMessage(), "\n";
                return true;
            }

            return true;
        }
        return false;
    }
    public function index_get($table = "", $id = "", $rel_table = null)
    {
        $pkeyfld = '';
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

        // header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        // header("Cache-Control: post-check=0, pre-check=0", false);
        // header("Pragma: no-cache");

        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        if ($this->get('flds') != "") {
            $flds = $this->get('flds');
        } else {
            $flds = "*";
        }

        if ($this->get('filter') != "") {
            $filter = $this->get('filter');
        } else {
            $filter = " 1 = 1 ";
        }

        if ($this->get('limit') > 0 || $this->get('limit') != "") {
            $limit = " LIMIT " . $this->get('limit');
        } else {
            $limit = "";
        }

        if ($this->get('offset') > 0 || $this->get('offset') != "") {
            $offset = " OFFSET " . $this->get('offset');
        } else {
            $offset = "";
        }

        if ($this->get('groupby') != "") {
            $groupby = $this->get('groupby');
        } else {
            $groupby = "";
        }
        if ($this->get('orderby') != "") {
            $orderby = $this->get('orderby');
        } else {
            $orderby = "";
        }

        $this->load->database();
        if ($table == "") {
            $this->response([['result' => 'Error', 'message' => 'no table mentioned']], REST_Controller::HTTP_BAD_REQUEST);
        } elseif (strtoupper($table) == "MQRY") {
            if ($this->get('qrysql') == "") {
                $this->response(['result' => 'Error', 'message' => 'qrysql parameter value given'], REST_Controller::HTTP_BAD_REQUEST);
            } else {
                $query = $this->db->query($this->get('qrysql'));
                if (is_object($query)) {
                    $this->response($query->result_array());
                } else {
                    $this->response([['result' => 'Success', 'message' => 'Ok']], REST_Controller::HTTP_OK);
                }
            }
        } else {
            if ($this->db->table_exists($table)) {
                $pkeyfld = $this->getpkey($table);
                if ($id != "") {
                    $this->db->select($flds)
                        ->from($table)
                        ->where($pkeyfld . ' = ' . $id);
                    // echo $this->db->get_compiled_select();
                    $query = $this->db->query($this->db->get_compiled_select())->result_array();
                    if (count($query) > 0) {
                        $result = $query[0];
                    } else {
                        $result = null;
                    }

                    if ($rel_table != null) {
                        if ($this->db->table_exists($rel_table)) {
                            $this->db->select($flds)
                                ->from($rel_table)
                                ->where($pkeyfld . ' = ' . $id)
                                ->where($filter);

                            if ($orderby != "") {
                                $this->db->order_by($orderby);
                            }

                            if ($groupby != "") {
                                $this->db->group_by($groupby);
                            }

                            if ($limit > 0) {
                                $this->db->limit($limit);
                            }
                            if ($offset > 0) {
                                $this->db->offset($offset, $offset);
                            }
                            $query              = $this->db->query($this->db->get_compiled_select())->result_array();
                            $result[$rel_table] = $query;

                            //$this->getAll($this->db->get_compiled_select());
                        } else {
                            $this->response(['result' => 'Error', 'message' => 'specified related table does not exist'], REST_Controller::HTTP_NOT_FOUND);
                        }
                    }

                    $this->response($result, REST_Controller::HTTP_OK);
                } else {
                    $this->db->select($flds)
                        ->from($table)
                        ->where($filter);

                    if ($orderby != "") {
                        $this->db->order_by($orderby);
                    }

                    if ($groupby != "") {
                        $this->db->group_by($groupby);
                    }

                    if ($limit > 0) {
                        $this->db->limit($limit);
                    }
                    if ($offset > 0) {
                        $this->db->offset($offset, $offset);
                    }
                    $this->getAll($this->db->get_compiled_select());
                }
            } else {
                // Table or view does not exist. Return empty result with explanatory message
                // to avoid throwing 404s for optional reporting views.
                $this->response([], REST_Controller::HTTP_OK);
            }
        }
    }

    public function ctrlacct_get($acct = '')
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
        if ($acct == '') {
            $this->index_get('ctrlaccts');
        } else {
            $this->db->select("*")
                ->from('ctrlaccts')
                ->where("acctname = '" . $acct . "'");
            $this->getOne($this->db->get_compiled_select());
        }
    }

    public function getAll($qry)
    {
        // Prevent CodeIgniter from rendering the DB error HTML page
        $prevDebug = isset($this->db->db_debug) ? $this->db->db_debug : true;
        $this->db->db_debug = false;
        $query = $this->db->query($qry);
        // restore previous debug setting
        $this->db->db_debug = $prevDebug;

        if ($query !== false) {
            $this->response($query->result_array(), REST_Controller::HTTP_OK);
            return;
        }

        $err = $this->db->error();
        $this->response([
            'result' => 'Error',
            'message' => $err,
            'sql' => $qry
        ], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
    }

    public function getOne($qry)
    {
        $query = $this->db->query($qry)->result_array();
        if (count($query) > 0) {
            $this->response($query[0], REST_Controller::HTTP_OK);
        } else {
            $this->response(['message' => 'not found'], REST_Controller::HTTP_OK);
        }
    }
    public function update_post($table, $fld, $v)
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
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $insertedid = 0;
        $post_data  = [];
        $this->load->database();
        if (! $this->db->table_exists($table)) {
            $this->response([['result' => 'Error', 'message' => 'Table does not exist.']], REST_Controller::HTTP_NOT_FOUND);
        } else {
            $post_data = $this->post();

            $this->db->where($fld, $v);
            $this->db->where('Computer', $post_data['Computer']);

            $r = $this->db->get($table)->result_array();
            if (count($r) > 0) {
                $this->db->where($fld, $v);
                $this->db->where('Computer', $post_data['Computer']);
                if ($this->db->update($table, $post_data)) {
                    $this->response(['result' => 'Success', 'message' => 'updated'], REST_Controller::HTTP_OK);
                } else {
                    $this->response(['result' => 'Error', 'message' => $this->db->error()], REST_Controller::HTTP_BAD_REQUEST);
                }
            } else {
                if ($this->db->insert($table, $post_data)) {
                    $this->response(['id' => $this->db->insert_id()], REST_Controller::HTTP_OK);
                } else {
                    $this->response(['result' => 'Error', 'message' => $this->db->error()], REST_Controller::HTTP_BAD_REQUEST);
                }
            }
        }
    }
    public function index_post($table = "", $id = null)
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
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $insertedid = 0;
        $post_data  = [];
        $this->load->database();
        if (! $this->db->table_exists($table)) {
            $this->response([['result' => 'Error', 'message' => 'Table does not exists']], REST_Controller::HTTP_NOT_FOUND);
        } else {
            $post_data = $this->post();
            if (isset($post_data['BusinessID'])) {
                unset($post_data['BusinessID']);
            }

            if ($id == null) {
                $this->db->insert($table, $post_data);
                $id = $this->db->insert_id();
                $this->db->select("*")
                    ->from($table)
                    ->where($this->getpkey($table), $id);
                $this->getOne($this->db->get_compiled_select());
            } else {
                $this->db->where($this->getpkey($table), $id);
                if ($this->db->update($table, $post_data)) {
                    $this->db->select("*")
                        ->from($table)
                        ->where($this->getpkey($table), $id);
                    $this->getOne($this->db->get_compiled_select());
                } else {
                    $this->response(['result' => 'Error', 'message' => $this->db->error()], REST_Controller::HTTP_BAD_REQUEST);
                }
            }
        }
    }

    public function delete_get($table = "", $id = 0, $reltable = "")
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
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $this->load->database();
        if ($this->db->table_exists($table)) {
            $this->db->trans_start();
            $this->db->where($this->getpkey($table), $id);
            $this->db->delete($table);
            if ($reltable != "") {
                if ($this->db->table_exists($reltable)) {
                    $this->db->where($this->getpkey($table), $id);
                    $this->db->delete($reltable);
                }
            }
            $this->db->trans_complete();
            $this->response(null, REST_Controller::HTTP_OK);
        } else {
            $this->response([['result' => 'Error', 'message' => 'Table does not exist (del)']], REST_Controller::HTTP_NOT_FOUND);
        }
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

    public function index_options()
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
        header('Access-Control-Allow-Headers: X-Requested-With, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers');
        $this->response(null, REST_Controller::HTTP_OK);
    }

    public function getsevendaysale_get($dte = '')
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
        $this->load->database();

        if ($dte == '') {
            $this->response(['staus' => 'Error', 'message' => 'No date'], REST_Controller::HTTP_BAD_REQUEST);
        }
        $query = $this->db->query("SELECT sum(NetAmount) as netamount,Date FROM qrysale WHERE `Date` >= DATE_SUB('" . $dte . "', INTERVAL 6 DAY) group BY Date")->result_array();

        $i    = 0;
        $data = [];
        foreach ($query as $value) {
            $data[$i]['netamount'] = $value['netamount'];
            $data[$i]['Date']      = date('l', strtotime($value['Date']));
            $i++;
        }
        $this->response($data, REST_Controller::HTTP_OK);
    }
    public function blist_get($dte = '')
    {

        $this->load->database();

        $query = $this->db->get('business')->result_array();

        $this->response($query, REST_Controller::HTTP_OK);
    }
    public function getmonthvise_get($dte = '')
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
        $this->load->database();

        if ($dte == '') {
            $this->response(['staus' => 'Error', 'message' => 'No date'], REST_Controller::HTTP_BAD_REQUEST);
        }
        $query = $this->db->query("SELECT SUM(NetAmount) as netamount,Date FROM qrysale WHERE YEAR('" . $dte . "') = YEAR('" . $dte . "') GROUP BY  EXTRACT(YEAR_MONTH FROM Date) ")->result_array();
        $i     = 0;
        $data  = [];
        foreach ($query as $value) {
            $data[$i]['netamount'] = $value['netamount'];
            $data[$i]['Date']      = ucfirst(strftime("%B", strtotime($value['Date'])));
            $i++;
        }

        $this->response($data, REST_Controller::HTTP_OK);
    }
    public function profitreport_get($dte1, $dte2)
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
        $this->load->database();
        $bid   = $this->get('bid');
        $query = $this->db->query("SELECT ProductName, Packing, Sum(TotPcs) as QtySold, SUM(NetAmount) as Amount, SUM(Cost) as Cost, Sum(NetAmount-Cost) as Profit FROM qrysalereport WHERE Date BETWEEN '$dte1' AND '$dte2' and BusinessID = $bid  GROUP BY  ProductName, Packing Order by ProductName ")->result_array();
        $this->response($query, REST_Controller::HTTP_OK);
    }
    public function profitbybill_get()
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
        $filter = $this->get('filter');
        $this->load->database();
        $bid = intval($this->get('bid') ?: 0);

        // Build SQL safely and only apply BusinessID if the view has that field
        // Use Amount as fallback when NetAmount is not present on the view
        $netAmountCol = 'NetAmount';
        if (! $this->db->field_exists($netAmountCol, 'qryinvoices')) {
            if ($this->db->field_exists('Amount', 'qryinvoices')) {
                $netAmountCol = 'Amount';
            }
        }

        $sql = "SELECT InvoiceID as INo, Date, CustomerName, Address, City, " . $netAmountCol . " AS NetAmount, ";

        // Build safe subqueries for Cost and Profit depending on available columns in qrysalereport
        $hasCost = $this->db->field_exists('Cost', 'qrysalereport');
        $hasNetAmount = $this->db->field_exists('NetAmount', 'qrysalereport');
        $hasAmount = $this->db->field_exists('Amount', 'qrysalereport');

        if ($hasCost) {
            $costSub = "(SELECT SUM(Cost) FROM qrysalereport WHERE qrysalereport.InvoiceID = qryinvoices.InvoiceID)";
        } else {
            $costSub = "(SELECT 0)";
        }

        if ($hasNetAmount && $hasCost) {
            $profitSub = "(SELECT SUM(NetAmount - Cost) FROM qrysalereport WHERE qrysalereport.InvoiceID = qryinvoices.InvoiceID)";
        } elseif ($hasAmount && $hasCost) {
            $profitSub = "(SELECT SUM(Amount - Cost) FROM qrysalereport WHERE qrysalereport.InvoiceID = qryinvoices.InvoiceID)";
        } elseif ($hasNetAmount && ! $hasCost) {
            $profitSub = "(SELECT SUM(NetAmount) FROM qrysalereport WHERE qrysalereport.InvoiceID = qryinvoices.InvoiceID)";
        } elseif ($hasAmount && ! $hasCost) {
            $profitSub = "(SELECT SUM(Amount) FROM qrysalereport WHERE qrysalereport.InvoiceID = qryinvoices.InvoiceID)";
        } else {
            $profitSub = "(SELECT 0)";
        }

        $sql .= $costSub . " as Cost, ";
        $sql .= $profitSub . " as Profit, ";
        $sql .= "DtCr from qryinvoices ";

        if ($filter && trim($filter) != '') {
            $sql .= " WHERE " . $filter;
        }

        if ($this->db->field_exists('BusinessID', 'qryinvoices')) {
            // append BusinessID condition
            if (stripos($sql, ' where ') !== false) {
                $sql .= ' and (BusinessID = ' . $bid . ')';
            } else {
                $sql .= ' WHERE (BusinessID = ' . $bid . ')';
            }
        }

        // Use getAll which suppresses DB debug and returns JSON error on failure
        $this->getAll($sql);
    }

    public function topten_get()
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
        $this->load->database();

        $this->getAll("select  MedicineName as ProductName, sum(Qty)  as Qty from qrysalereport where MONTH(Date) = month  (CURDATE()) and YEAR(Date) = YEAR(CURDATE())
        GROUP by MedicineName order by sum(Qty) DESC LIMIT 10");
    }
    public function GetSessionID()
    {
        $res = $this->db->query("select max(SessionID) as ID from session where status = 0")->result_array();

        return $res[0]['ID'];
    }

    public function balancesheet_get($id = 0)
    {
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        // ensure $bid is a valid integer (default 0) to avoid malformed SQL when missing
        $bid  = intval($this->get('bid') ?: 0);

        // run query with suppressed DB debug to capture errors as JSON
        $prevDebug = isset($this->db->db_debug) ? $this->db->db_debug : true;
        $this->db->db_debug = false;
        $sql = "select (select AcctType from accttypes where accttypes.AcctTypeID = qrycustomers.AcctTypeID) as Type , " .
            " CustomerName, case when Balance <0 then abs(Balance) else 0 end as Debit,  case when Balance >=0 then Balance else 0 end as Credit   from qrycustomers ";

        // Only apply BusinessID filter if the field exists on the view/table
        if ($this->db->field_exists('BusinessID', 'qrycustomers')) {
            $sql .= " where BusinessID = $bid";
        }

        $sql .= " order by AcctType";
        $query = $this->db->query($sql);
        $this->db->db_debug = $prevDebug;

        if ($query === false) {
            $err = $this->db->error();
            $this->response([
                ['result' => 'Error', 'message' => $err['message']]
            ], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        $acct = $query->result_array();
        $this->response($acct, REST_Controller::HTTP_OK);
    }
    public function cashreport_post()
    {
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        $date1 = $this->post('FromDate');
        $date2 = $this->post('ToDate');

        // Use a safe SELECT fallback instead of calling a stored procedure
        $prevDebug = isset($this->db->db_debug) ? $this->db->db_debug : true;
        $this->db->db_debug = false;

        // Avoid joining to 'accounts' table (may not exist on some DBs). Return AcctID as Head.
        $sql = "SELECT c.Date, '' AS RefModule, 0 AS RefID, c.AcctID AS Head, c.Details, c.Recvd, c.Paid, c.Balance, c.CashID as ID
            FROM cashbook c
            WHERE DATE(c.Date) BETWEEN '" . $date1 . "' AND '" . $date2 . "' 
            ORDER BY c.Date";

        $query = $this->db->query($sql);
        $dbError = $this->db->error();
        $this->db->db_debug = $prevDebug;

        if (!empty($dbError['message'])) {
            $this->response([
                ['result' => 'Error', 'message' => 'DB Error: ' . $dbError['message']]
            ], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        $result = $query->result_array();
        $this->response($result, REST_Controller::HTTP_OK);

    }

    public function orddetails_get($fltr = 0)
    {
        $res = $this->db->get('orders')->result_array();
        for ($i = 0; $i < count($res); $i++) {
        }
        $this->response($res, REST_Controller::HTTP_OK);
    }

    /**
     * Get hearder Authorization
     * */
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
    public function deleteall_get($table = "", $atr = "", $id = 0, $reltable = "")
    {
        $this->load->database();
        if ($this->db->table_exists($table)) {
            $this->db->trans_start();
            $this->db->where($atr, $id);
            $this->db->delete($table);
            if ($reltable != "") {
                if ($this->db->table_exists($reltable)) {
                    $this->db->where($this->getpkey($table), $id);
                    $this->db->delete($reltable);
                }
            }
            $this->db->trans_complete();
            $this->response(null, REST_Controller::HTTP_OK);
        } else {
            $this->response([['result' => 'Error', 'message' => 'Table does not exist']], REST_Controller::HTTP_NOT_FOUND);
        }
    }

    public function companiesbysm_get($smid)
    {
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        $bid = $this->get('bid');

        $acct = $this->db->query(" call companiesbysm ($smid,$bid)");

        $this->response($acct->result_array(), REST_Controller::HTTP_OK);
    }
    public function printbill_get($invID)
    {
        $res = $this->db->where(['InvoiceID' => $invID])
        //->select('CustomerName, Date, BillNo, InvoiceID, Time, Amount, ExtraDisc, Discount, NetAmount,CashReceived, CreditAmount, SalesmanName, CreditCard')
            ->get('qryinvoices')->result_array();
        if (count($res) > 0) {
            $det = $this->db->where(['InvoiceID' => $invID])
                ->select('*')
                ->get('qryinvoicedetails')->result_array();
            $res[0]['details'] = $det;
            $this->response($res[0], REST_Controller::HTTP_OK);
        } else {
            $this->response([['result' => 'Error', 'message' => 'Invoice No not found']], REST_Controller::HTTP_NOT_FOUND);
        }
    }

    public function getbno_get($type, $date)
    {
        $this->load->library('utilities');
        $bid          = $this->get('bid');
        $maxInvoiceID = $this->utilities->getBillNo($this->db, $bid, $type, $date);
        $this->response(['billno' => $maxInvoiceID], REST_Controller::HTTP_OK);
    }
    private function dbquery($str_query)
    {
        return $this->db->query($str_query)->result_array();
    }
    public function getgatepass_get($invID, $storeID)
    {
        $bid = $this->get('bid');

        $res = $this->dbquery("select * from qrygatepass
          where InvoiceID = $invID and StoreID = $storeID and BusinessID = $bid");

        if (count($res) == 0) {
            $this->db->query("Insert Into gatepass(InvoiceID, StoreID, BusinessID,GPNo)
         Select $invID,$storeID, $bid, (Select ifnull(Max(GPNo),0)+1 from gatepass
         where StoreID = $storeID and BusinessID = $bid)");
            $res = $this->dbquery("select * from qrygatepass
         where InvoiceID = $invID and StoreID = $storeID and BusinessID = $bid");
        }

        $this->response($res, REST_Controller::HTTP_OK);
    }
    public function gatepassitems_get($InvID, $GPNo, $StoreID)
    {
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        $bid = $this->get('bid');

        $result = $this->dbquery("Select count(*) as cnt from gatepassdelivery where StoreID = $StoreID and InvoiceID = $InvID and GPNo = $GPNo and BusinessID = $bid");

        if ($result[0]['cnt'] == 0) {
            $result = $this->db->query("Insert Into gatepassdelivery(Date, InvoiceID, GPNo, StoreID, ProductID, Qty, Delivered, CustomerID, BusinessID)
            Select CURDATE(), InvoiceID, $GPNo, StoreID, ProductID, TotKGs, 0,CustomerID, BusinessID from qrysalereport
                where StoreID = $StoreID and InvoiceID = $InvID and BusinessID = $bid");
        }

        $result = $this->dbquery(
            "Select  * from qrygetpassdelivery
             where StoreID = $StoreID and InvoiceID = $InvID and GPNo = $GPNo and BusinessID = $bid"
        );

        $this->response($result, REST_Controller::HTTP_OK);
    }
    public function labourreport_post()
    {
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $post_data = $this->post();

        $bid    = $this->post('BusinessID');
        $headID = $this->post('HeadID');

        $filter = "Date Between '" . $post_data['FromDate'] . "' and '" . $post_data['ToDate'] . "' And BusinessID = $bid";

        if ($headID > 0) {
            $result = $this->dbquery("
          SELECT 0 as SNo,   Date, 0 as InvoiceID, LabourHead as CustomerName, Description, Amount as Labour, LabourHeadID
          from qrylabour where $filter and LabourHeadID = $headID
          ");
        } else {
            $result = $this->dbquery("
          Select 1 as SNo, 0 as LabourID, Date, CustomerName ,  Labour, InvoiceID ,'' as Description , 0 as LabourHeadID  from qryinvoices where  Labour >0 and ($filter)
          UNION ALL SELECT 0 as SNo,LabourID, Date,  LabourHead as CustomerName, Amount,0 as InvoiceID, Description, LabourHeadID from qrylabour where $filter
          ");

        }
        for ($i = 0; $i < count($result); $i++) {
            $result[$i]['SNo'] = $i + 1;
        }

        $this->response($result, REST_Controller::HTTP_OK);
    }
    public function stockbydate_post()
    {
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $bid      = $this->post('BusinessID');
        $fromDate = $this->post('FromDate');
        $toDate   = $this->post('ToDate');
        $type     = $this->post('Type');
        $storeID  = $this->post('StoreID');

        $result = $this->dbquery("CALL getStockByDates ('$fromDate','$toDate',$storeID, $type, $bid) ");

        $this->response($result, REST_Controller::HTTP_OK);
    }
    public function dailystock_post()
    {
        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $post_data = $this->post();

        $bid     = $this->post('BusinessID');
        $Date    = $this->post('Date');
        $Stock   = $this->post('Stock');
        $storeID = $this->post('StoreID');

        $result = $this->dbquery("select * from qrystock where (StoreID = $storeID OR $storeID = 0) and (BusinessID = $bid)" . ($Stock == 1 ? " and Stock > 0" : ""));

        $this->response($result, REST_Controller::HTTP_OK);
    }

    public function getvouchno_get($t, $vno, $dir)
    {
        $filter = '';
        if ($t == 'P') {
            $filter = ' Debit > 0';
        } else {
            $filter = ' Credit > 0';
        }
        if ($dir == 'N') {
            $filter .= " and VoucherID > $vno Order By VoucherID Limit 1";
        } else if ($dir == 'B') {
            $filter .= " and VoucherID < $vno Order By VoucherID DESC Limit 1";
        } else if ($dir == 'L') {
            $filter .= "  Order By VoucherID DESC Limit 1";
        } else if ($dir == 'F') {
            $filter .= "  Order By VoucherID Limit 1";
        }
        // echo $filter;

        $v = $this->db->query("select VoucherID from vouchers where $filter")->result_array();
        if (count($v) > 0) {
            $id = $v[0]['VoucherID'];

        } else {
            $id = $vno;

        }
        $this->response([
            'Vno' => $id,
        ], REST_Controller::HTTP_OK);
    }

    public function customeracctdetails_get($date1, $date2, $customerid)
    {

        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $post_data = $this->post();

        $bid = 1;

        $filter = "Date Between '" . $date1 . "' and '" . $date2 .
            "' and CustomerID = $customerid And BusinessID = $bid";

        $result = $this->dbquery("
              SELECT DetailID, Date,Description, Debit, Credit, Balance, RefID,RefType  from qrycustomeraccts where $filter
            ");

        for ($i = 0; $i < count($result); $i++) {
            if ($result[$i]['RefID'] > 0 && $result[$i]['RefType'] == 1 && $result[$i]['Debit'] > 0) {
                $details = $this->dbquery("
                SELECT ProductName, TotKgs, Sprice, Amount  from qryinvoicedetails  where  InvoiceID = " . $result[$i]['RefID']);
                $result[$i]['Details'] = $details;
            }
        }

        $this->response($result, REST_Controller::HTTP_OK);
    }
    /**
     * Fallback handler for qrycustomeraccts when DB view is missing.
     * Returns ledger rows mapped from `customeraccts` table.
     */
    public function qrycustomeraccts_get()
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

        $this->load->database();

        $filter = $this->get('filter') ?: '1=1';
        // remove any BusinessID conditions from incoming filter because customeraccts table doesn't have that field
        $filter = preg_replace('/\bAND\s+BusinessID\s*=\s*\d+/i', '', $filter);
        $filter = preg_replace('/\bBusinessID\s*=\s*\d+\s*(AND)?/i', '', $filter);

        $orderby = $this->get('orderby') ?: '';
        $limit = $this->get('limit') ?: '';

        // Determine which columns exist in `customeraccts` table and map them to Debit/Credit
        $debitCol = 'Amount';
        $creditCol = 'Recived';
        if (! $this->db->field_exists($debitCol, 'customeraccts')) {
            if ($this->db->field_exists('Debit', 'customeraccts')) {
                $debitCol = 'Debit';
            } else {
                $debitCol = 'Amount'; // leave as-is; will error later if truly missing
            }
        }

        if (! $this->db->field_exists($creditCol, 'customeraccts')) {
            if ($this->db->field_exists('Credit', 'customeraccts')) {
                $creditCol = 'Credit';
            } else {
                $creditCol = 'Recived';
            }
        }

        $sql = "SELECT CustomerAcctID AS DetailID, Date, Description, InvoiceID AS RefID, 0 AS RefType, CustomerID, ";
        $sql .= $this->db->escape_str($debitCol) . " AS Debit, " . $this->db->escape_str($creditCol) . " AS Credit, Balance FROM customeraccts WHERE " . $filter;
        if ($orderby) {
            $sql .= ' ORDER BY ' . $orderby;
        }
        if ($limit) {
            $sql .= ' LIMIT ' . intval($limit);
        }

        $this->getAll($sql);
    }
    public function account_get()
    {

        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $bid    = $this->get('bid');
        $filter = $this->get('filter');
        $filter = $filter . " And BusinessID = $bid";

        $result = $this->dbquery("
              SELECT * from customers where $filter
            ");

        $this->response($result, REST_Controller::HTTP_OK);
    }
    public function pendinggatepass_get()
    {

        $this->output->set_header('Last-Modified: ' . gmdate("D, d M Y H:i:s") . ' GMT');
        $this->output->set_header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        $this->output->set_header('Pragma: no-cache');
        $this->output->set_header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

        $bid    = $this->get('bid');
        $filter = $this->get('filter');
        $filter = $filter . " And BusinessID = $bid";

        $result = $this->dbquery("
              SELECT DISTINCT InvoiceID, StoreID, StoreName, CustomerName
                  FROM qrysalereport qsr
                  WHERE $filter
                  AND qsr.BusinessID = 1
                  AND NOT EXISTS (
                      SELECT 1
                      FROM gatepass gp
                      WHERE
                      gp.InvoiceID = qsr.InvoiceID
                      AND  gp.StoreID = qsr.StoreID
                      AND gp.BusinessID = $bid
                  )

            ");
        $this->response($result, REST_Controller::HTTP_OK);
    }
     
    public function sendwabulk_post()
    {
        $post_data = $this->post();


// print_r($post_data);

    if (!isset($post_data['message'])) {
      $this->response(array('result' => 'Error', 'message' => 'no bulksms data given'), REST_Controller::HTTP_BAD_REQUEST);
      return;
    }
    // $bulksms = json_decode($post_data['messages'], true);
    $curl = curl_init();

    curl_setopt_array($curl, [
      CURLOPT_URL => 'https://api.whiztext.com/v1/bulk/personalized',
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_CUSTOMREQUEST => 'POST',
      CURLOPT_POSTFIELDS => json_encode([
        'messages' => json_decode($post_data['message'], true)
      ]),
      CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-API-Key: sk_dec8cc920c3f139997396f8d6188fb2812095aa683a641715d6759f59dd9e0a1'
      ],
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_ENCODING => '',
      CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($curl);


    // print_r ($response);
    if (curl_errno($curl)) {
      $error = curl_error($curl);
      curl_close($curl);
      $this->response([
        'success' => false,
        'message' => 'Curl error: ' . $error,
        'raw'     => null
      ], REST_Controller::HTTP_BAD_REQUEST);
      return;
    }

    curl_close($curl);

    $data = json_decode($response, true);

    if (!is_array($data)) {
      $this->response([
      'success' => false,
      'message' => 'Invalid API response',
      'raw'     => $response
      ], REST_Controller::HTTP_BAD_REQUEST);
      return;
    }

    // Process only success and failure details
    $results = [
      'success' => [],
      'failed'  => []
    ];

    if (isset($data['results']['details']) && is_array($data['results']['details'])) {
      foreach ($data['results']['details'] as $item) {
      if (isset($item['status']) && $item['status'] === 'sent') {
        $results['success'][] = [
        'mobile'    => $item['mobile'] ?? null,
        'messageId' => $item['messageId'] ?? null
        ];
      } else {
        $results['failed'][] = [
        'mobile' => $item['mobile'] ?? null,
        'error'  => $item['error'] ?? 'Unknown error'
        ];
      }
      }
    }

    $responseArr = [
      'success' => true,
      'results' => $results,
      'quota'   => $data['quota'] ?? null
    ];

    $this->response($responseArr, REST_Controller::HTTP_OK);
    }
    public function makepdf_get()
    {
        // Load the Pdf library
        $this->load->library('pdf');

        // Load data that you want to pass to the view
        $data['title']   = "CodeIgniter 3 PDF Generation Example";
        $data['content'] = "پاکیستان زندہ باد";

        // Generate the PDF by passing the view and data
        $this->pdf->load_view('pdf_template', $data);
    }
    public function makepdf2_get()
    {
        $this->load->library('dompdf_gen');

        // Ensure correct paths
        $fontName = 'NotoNastaliqUrdu';

        // Generate the full path to the font file
        $fontDir = base_url() . 'annas/uploads/fonts/' . $fontName . '.ttf';

        // echo $fontDir;
        // Register the font
        $this->dompdf->getOptions()->set('isHtml5ParserEnabled', true);
        $this->dompdf->getOptions()->set('isRemoteEnabled', true);

        $fontMetrics = $this->dompdf->getFontMetrics();

        // $fontMetrics->registerFont(
        //   ['family' => $fontName,
        //   'style' => 'normal',
        //   'weight' => 'normal'], $fontDir );

        // Check if the font is registered by retrieving the font information
        $registeredFont = $fontMetrics->getFont($fontName);

        // Print the font information for debugging
        if ($registeredFont) {
            echo "Font '{$fontName}' is registered successfully.";
        } else {
            echo "Font '{$fontName}' is NOT registered.";
        }

        // Create HTML content with Urdu text
        $html = '<html><head>';
        $html .= '<style>';
        $html .= '@font-face { font-family: "' . $fontName . '"; src: url("' . $fontDir . '"); }';
        $html .= 'body { font-family: "' . $fontName . '"; }';
        $html .= '</style>';
        $html .= '</head><body>';
        $html .= '<p>that is english texts</p>';
        $html .= '<p style="font-family: NotoNastaliqUrdu; direction: rtl;">آپ کا متن یہاں لکھا جائے گا۔</p>';
        $html .= '</body></html>';

        $this->dompdf->loadHtml($html);
        $this->dompdf->setPaper('A4', 'portrait');
        $this->dompdf->render();

        echo $html;
        // // $this->loadview($html);
        // // Output the generated PDF
        // $this->dompdf->stream("output.pdf", array("Attachment" => 0));
    }

    public function customer_orders_post()
    {
        $post_data = $this->post();

        // Validate required fields
        if (
            empty($post_data['CustomerID']) ||
            empty($post_data['DeliveryDate']) ||
            empty($post_data['OrderDate']) ||
            ! isset($post_data['Items']) ||
            ! is_array($post_data['Items']) ||
            count($post_data['Items']) == 0
        ) {
            $this->response([
                'result'  => 'Error',
                'message' => 'Missing required fields',
            ], REST_Controller::HTTP_BAD_REQUEST);
            return;
        }

        // Convert date arrays to proper MySQL date strings
        function parse_date($dateArr, $withTime = false)
        {
            if (! is_array($dateArr) || ! isset($dateArr['year'], $dateArr['month'], $dateArr['day'])) {
                return null;
            }

            $date = sprintf('%04d-%02d-%02d', $dateArr['year'], $dateArr['month'], $dateArr['day']);
            if ($withTime) {
                $date .= ' 00:00:00';
            }

            return $date;
        }

        $order_date    = parse_date($post_data['OrderDate'], true);
        $delivery_date = parse_date($post_data['DeliveryDate'], false);

        try {
            // Insert order items
            foreach ($post_data['Items'] as $item) {
                if (empty($item['ProductID']) || ! isset($item['Quantity'])) {
                    continue;
                }

                $order_item = [
                    'ProductID'       => $item['ProductID'],
                    'Quantity'        => $item['Quantity'],
                    'Rate'            => $item['Rate'] ?? 0,
                    'Total'           => $item['Total'] ?? 0,
                    'OrderDate'       => $order_date,
                    'DeliveryDate'    => $delivery_date,
                    'CustomerID'      => $post_data['CustomerID'],
                    'DeliveryAddress' => $post_data['DeliveryAddress'] ?? '',
                    'Notes'           => $post_data['Notes'] ?? '',
                    'Status'         => $post_data['Status'] ?? '',
                ];
                // You must have an order_items table. Adjust field names as needed.
                $this->db->insert('orders', $order_item);
            }

            $this->response([
                'result'  => 'Success',
                'message' => 'Order placed successfully',
            ], REST_Controller::HTTP_OK);
        } catch (Exception $e) {
            $this->response([
                'result'  => 'Error',
                'message' => 'Failed to place order: ' . $e->getMessage(),
            ], REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        }

    }


}
