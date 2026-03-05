<?php  if (! defined('BASEPATH')) {
    exit('No direct script access allowed');
}


class Users_model extends CI_Model
{
    public function __construct()
    {
        $this->load->database();
    }

    public function get($userid)
    {
        $this->db->select('*')->from('users');

        //echo $userid;

        $query=$this->db->get();
        //print_r ($query->result_array());
        return $query->result_array();
    }
    public function login($username, $password)
    {
        $this->db->select('*');
        $this->db->from('users');

        $this->db->where('UserName', $username);
        $this->db->where('Password', $password);
        $query = $this->db->get();
        if ($query->num_rows() == 1) {
            $result = $query->result();
            return $result[0];
        }
        return false;
    }
}
