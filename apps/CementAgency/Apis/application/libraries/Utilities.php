<?php
// Note, this cannot be namespaced for the time being due to how CI works
//namespace Restserver\Libraries;

defined('BASEPATH') or exit('No direct script access allowed');
class Utilities
{

    public function getBillNo($db, $bid, $type, $date)
    {

        if ($type == 1) {
            $table = 'invoices';
        } else if ($type == 2) {
            $table = 'pinvoices';
        } else if ($type == 3) {
            $table = 'vouchers';
        }

        $query = $db->query("
        SELECT MAX(" . ($type == 3 ? 'VoucherID' : 'InvoiceID') . ") as ID  FROM $table WHERE
            `BusinessID` = $bid
        ")->result_array();

        // print_r($query[0]);

        if (! isset($query[0]['ID'])) {

            $maxInvoiceID = $bid . '00000000'; // Retrieve the maximum InvoiceID

        } else {
            $maxInvoiceID = $query[0]['ID'];

        }
// echo $maxInvoiceID;
        return $maxInvoiceID;
    }

}
