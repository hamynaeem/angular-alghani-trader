<?php

class Accounts_model extends CI_Model {

    public function get($id) {
        
        $query = $this->db->query('select * from accounts where accountid = ' .$id);
        //print_r ($query->result_array());
        return $query->result_array();
    }

    public function getAll() {
        $this->db->select('*')->from('accounts');
        $query = $this->db->get();
//print_r ($query->result_array());
        return $query->result_array();
    }

    public function save($data) {
        $this->db->insert('accounts', $data); 
        return $this->db->affected_rows();
    }
    public function update($data) {
    //    echo $data['projectid'];
    //    print_r ($data);
        $this->db->where('accountid', $data['accountid']);
        $this->db->update('accounts', $data);
        return TRUE;
    }
    public function delete($id) {
    //    echo $data['projectid'];
    //    print_r ($data);
        $this->db->where('accountid',$id);
        $this->db->delete('accounts');
        return TRUE;
    }
}
