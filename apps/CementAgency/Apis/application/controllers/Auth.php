<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . '/libraries/REST_Controller.php';
require_once APPPATH . '/libraries/JWT.php';

use Restserver\Libraries\REST_Controller;
use \Firebase\JWT\JWT;

class Auth extends REST_Controller
{
    public function __construct()
    {
        parent::__construct();
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

        $this->load->database();
        $this->load->model('Users_model');
    }

    public function login_post()
    {
        $username   = $this->post('username');
        $password   = $this->post('password');
        $BusinessID = $this->post('BusinessID');
        $date       = $this->post('date');

        if (!$username || !$password) {
            return $this->response(['invalid' => $username], REST_Controller::HTTP_NOT_FOUND);
        }

        // Validate user
        $User = $this->db->get_where('users', [
            'username'   => $username,
            'password'   => $password,
            'BusinessID' => $BusinessID
        ])->row_array();

        if (!$User) {
            return $this->response(
                ['status' => 'false', 'msg' => 'Invalid Username or Password'],
                REST_Controller::HTTP_NOT_FOUND
            );
        }

        // Validate business + expiry check
        $bdata = $this->db->get_where('business', ['BusinessID' => $User['BusinessID']])->row_array();
        if (!$bdata || empty($bdata['ExpiryDate'])) {
            return $this->response(
                ['status' => 'false', 'msg' => 'Account has been expired'],
                REST_Controller::HTTP_BAD_REQUEST
            );
        }

        $today      = new DateTime(date('Y-m-d'));
        $expiryDate = new DateTime($bdata['ExpiryDate']);
        if ($today > $expiryDate) {
            return $this->response(
                ['status' => 'false', 'msg' => 'Your account expired on ' . $expiryDate->format('M j, Y')],
                REST_Controller::HTTP_BAD_REQUEST
            );
        }

        // Get last closing record
        $lastClosing = $this->db->query("
            SELECT * FROM closing
            WHERE ClosingID = (SELECT MAX(ClosingID) FROM closing WHERE BusinessID = ?)
        ", [$BusinessID])->row_array();

        // If last closing exists and still open
        if ($lastClosing && $lastClosing['Status'] == 0) {
            if ((new DateTime($lastClosing['Date']))->format('Y-m-d') === (new DateTime($date))->format('Y-m-d')) {
                $output = $this->CreateOutput($User, $lastClosing, $bdata);
                return $this->set_response($output, REST_Controller::HTTP_OK);
            }
            return $this->set_response(
                ['msg' => 'Please login on date: ' . date("M j, Y", strtotime($lastClosing['Date']))],
                REST_Controller::HTTP_BAD_REQUEST
            );
        }

        // Handle case where account already closed
        if ($lastClosing && new DateTime($date) <= new DateTime($lastClosing['Date'])) {
            return $this->set_response(
                ['msg' => 'Account Closed For this Date. Please Login on next date'],
                REST_Controller::HTTP_BAD_REQUEST
            );
        }

        // Only admin can open new account
        if ($User['GroupID'] != 1) {
            return $this->response(
                ['status' => 'false', 'msg' => 'You are not allowed to open account'],
                REST_Controller::HTTP_NOT_FOUND
            );
        }

        // Insert new closing record
        $OpnAmnt = $lastClosing ? $lastClosing['ClosingAmount'] : 0;
        $this->db->insert('closing', [
            'Date'          => $date,
            'Status'        => 0,
            'BusinessID'    => $BusinessID,
            'OpeningAmount' => $OpnAmnt
        ]);
        $newClosing = $this->db->get_where('closing', ['ClosingID' => $this->db->insert_id()])->row_array();

        $output = $this->CreateOutput($User, $newClosing, $bdata);
        $output['date'] = date("Y-m-d", strtotime($newClosing['Date']));
        $output['msg']  = 'New Account Opened Successfully!';

        return $this->set_response($output, REST_Controller::HTTP_OK);
    }

    private function CreateOutput($User, $closing, $bdata)
    {
        unset($User['password']);

        $date = new DateTime();
        $token = [
            'id'  => $User['UserID'],
            'iat' => $date->getTimestamp(),
            'exp' => $date->getTimestamp() + 60 * 60 * 9
        ];

        return [
            'token'      => JWT::encode($token, $this->config->item('api_key')),
            'userid'     => $User['UserID'],
            'rights'     => $User['GroupID'],
            'userdata'   => $User,
            'bdata'      => $bdata,
            'businessid' => $User['BusinessID'],
            'closingid'  => $closing['ClosingID'],
            'date'       => date("Y-m-d", strtotime($closing['Date'])),
            'msg'        => 'Logged in successfully'
        ];
    }

    public function index_options()
    {
        header('Access-Control-Allow-Headers: X-Requested-With, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers');
        return $this->response(null, REST_Controller::HTTP_OK);
    }
}
