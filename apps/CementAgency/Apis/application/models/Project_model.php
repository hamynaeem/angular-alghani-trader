<?php

class Project_model extends CI_Model {

    public function get($id) {
        
        $query = $this->db->query('select * from projects where projectid = ' .$id);
        //print_r ($query->result_array());
        return $query->result_array();
    }

    public function getAll() {
        $this->db->select('*')->from('projects');
        $query = $this->db->get();
//print_r ($query->result_array());
        return $query->result_array();
    }

    public function save($data) {
        $this->db->insert('projects', $data); 
        return $this->db->affected_rows();
    }
    public function update($data) {
    //    echo $data['projectid'];
    //    print_r ($data);
        $this->db->where('projectid', $data['projectid']);
        $this->db->update('projects', $data);
        return TRUE;
    }
    public function delete($id) {
    //    echo $data['projectid'];
    //    print_r ($data);
        $this->db->where('projectid',$id);
        $this->db->delete('projects');
        return TRUE;
    }
    
    public function getUnit($id) {
        
        $query = $this->db->query('select * from projectunits where unitid = ' .$id);
        //print_r ($query->result_array());
        return $query->result_array();
    }

    public function getAllUnits() {
        $this->db->select('*')->from('qryunits');
        $query = $this->db->get();
//print_r ($query->result_array());
        return $query->result_array();
    }

    public function saveUnit($data) {
        $this->db->insert('projectunits', $data); 
        return $this->db->affected_rows();
    }
    public function updateUnit($data) {
    //    echo $data['projectid'];
    //    print_r ($data);
        $this->db->where('unitid', $data['unitid']);
        $this->db->update('projectunits', $data);
        return TRUE;
    }
    public function deleteUnit($id) {
    //    echo $data['projectid'];
    //    print_r ($data);
        $this->db->where('unitid',$id);
        $this->db->delete('projectunits');
        return TRUE;
    }
}
