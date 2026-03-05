export const OrdersListSettings = {
  tableName: 'qrysaleorders',
  pk: 'order_id',
  sort: ['0', 'desc'],
  columns: [
    {
      data: 'order_id',
      label: 'ID',
    },
    {
      data: 'customer_name',
      label: 'Customer Name',
    },
    {
      data: 'cell_no',
      label: 'Cell No',
    },
    {
      data: 'whatsapp_no',
      label: 'WhatsApp No',
    },
    {
      data: 'address',
      label: 'Address',
    },
    {
      data: 'amount',
      label: 'Country',
    },
    {
      data: 'vat',
      label: 'VAT',
    },
    {
      data: 'net_amount',
      label: 'Net Amount',
    },
    {
      data: 'status_id',
      label: 'Status',
      visible: false,
    },
  ],
  actions: [
    {
      action: 'edit',
      title: 'Edit',
      icon: 'pencil',
      class: 'primary',
    },
    {
      action: 'print',
      title: 'Print',
      icon: 'print',
      class: 'success',
    },
    {
      action: 'invoice',
      title: 'Create Invoice',
      icon: 'plus',
      class: 'warning',
    },
    {
      action: 'delete',
      title: 'Delete',
      icon: 'trash',
      class: 'danger',
    },
  ],
  crud: false,
};

export const InvoiceListSettings = {
  tableName: 'qryinvoices',
  pk: 'invoice_id',
  columns: [
    {
      data: 'invoice_id',
      label: 'ID',
    },
    {
      data: 'date',
      label: 'Date',
    },
    {
      data: 'customer_name',
      label: 'Customer Name',
    },
    {
      data: 'amount',
      label: 'Amount',
    },
    {
      data: 'vat',
      label: 'Tax',
    },
    {
      data: 'net_amount',
      label: 'Total Amount',
    },
    {
      data: 'received',
      label: 'Received',
    },
    {
      data: 'balance',
      label: 'Balance',
    },
    {
      data: 'isposted',
      label: 'Is Posted',
      visible: false,
    },
  ],
  actions: [
    {
      action: 'edit',
      title: 'Edit',
      icon: 'pencil',
      class: 'primary',
    },
    {
      action: 'post',
      title: 'Post',
      icon: 'check',
      class: 'warning',
    },
    {
      action: 'print',
      title: 'Print',
      icon: 'print',
      class: 'success',
    },
    {
      action: 'delete',
      title: 'Delete',
      icon: 'trash',
      class: 'danger',
    },
    {
      action: 'pay',
      title: 'Add Payment',
      icon: 'money',
      class: 'success',
    },
    ``,
  ],
  crud: false,
};
