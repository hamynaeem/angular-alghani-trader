<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Datatables_model extends CI_Model
{

  var $table = 'persons';
  var $filter = '';
  var $columns = array();
  var $order = array('id' => 'asc');

  public function __construct()
  {
    parent::__construct();
    $this->load->database();
  }

  private function _get_datatables_query($post_data)
  {

    $this->db->from($this->table)->where($this->filter);
    $i = 0;
    foreach ($this->columns as $item) // loop column
    {
    if ($post_data['search']) { // if datatable send POST for search
        if ($item['searchable']) {
            if ($i === 0) { // first loop
                $this->db->group_start(); // open bracket. query Where with OR clause better with bracket. because maybe can combine with other WHERE with AND.
                $this->db->like($item['data'], $post_data['search']['value']);
            } else {
                $this->db->or_like($item['data'], $post_data['search']['value']);
            }
            $i++;
        }


    }
}

    if ( $i > 0) { //last loop
      $this->db->group_end();
  } //close bracket

    if (isset($post_data['order'])) // here order processing
    {
      $this->db->order_by(
        $this->columns[$post_data['order']['0']['column']      //index of order column in post_data
        ]['data'],                              //column name
        $post_data['order']['0']['dir']
      );
    }
  }

  function get_datatables($table, $filter, $post_data)
  {
    $this->table = $table;
    $this->filter = $filter;
    $this->columns =  $post_data['columns'];

    $this->_get_datatables_query($post_data);
    $select = '';
    $x = 0;
    foreach ($this->columns as $sterm) {
      $select .= $sterm['data'];
      $x++;
      if ($x < count($this->columns)) $select .= ',';
    }

    $this->db->select($select);

    if (isset($post_data['length']) && $post_data['length'] != -1)
      $this->db->limit($post_data['length'], $post_data['start']);
    $query = $this->db->get();
    return $query->result_array();
  }

  function count_filtered($post_data)
  {
    $this->_get_datatables_query($post_data);
    $query = $this->db->get();
    return $query->num_rows();
  }

  public function count_all()
  {
    $this->db->from($this->table)->where($this->filter);
    return $this->db->count_all_results();
  }
}
