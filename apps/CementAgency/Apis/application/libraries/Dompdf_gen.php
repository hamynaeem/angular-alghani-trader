<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Include the main Dompdf library
require_once APPPATH . 'libraries/dompdf/autoload.inc.php';

use Dompdf\Dompdf;

class Dompdf_gen
{
    public function __construct()
    {
        // Create a new Dompdf instance
        $this->dompdf = new Dompdf();

          $pdf = new Dompdf();
          $CI = &get_instance();
          $CI->dompdf = $pdf;
    }

    public function load_view($view, $data = [], $filename = 'document', $stream = TRUE)
    {
        // Load the view into a variable
        $html = get_instance()->load->view($view, $data, TRUE);

        // Load HTML content into Dompdf
        $this->dompdf->loadHtml($html);

        // (Optional) Setup the paper size and orientation
        $this->dompdf->setPaper('A4', 'portrait');

        // Render the PDF
        $this->dompdf->render();

        if ($stream) {
            // Stream the generated PDF to the browser
            $this->dompdf->stream($filename . ".pdf", array("Attachment" => 0));
        } else {
            // Return the generated PDF as a string
            return $this->dompdf->output();
        }
    }



}
