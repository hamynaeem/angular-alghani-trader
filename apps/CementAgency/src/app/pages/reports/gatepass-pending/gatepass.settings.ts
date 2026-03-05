import { AddInputFld } from '../../../../../../../libs/future-tech-lib/src/lib/components/crud-form/crud-form-helper';

export const GPSetting  = {

   tableName: 'qrygatepass',
    pk: 'ID',
    crud: true,

    Columns: [

      { fldName: 'InvoiceID', label: 'Invoice' },

      { fldName: 'StoreName', label: 'Store' },
      { fldName: 'Date', label: 'Date' },
      { fldName: 'CustomerName', label: 'CustomerName' },


    ],
  Actions: [
    // {
    //   action: 'delivery',
    //   title: 'Deliver',
    //   icon: 'check',
    //   class: 'success',
    // },
    {
      action: 'print',
      title: 'Print Gatepass',
      icon: 'print',
      class: 'primary',
    },
  ],
  SubTable: {
    table: 'details',
    Columns: [
      {
        label: 'Store',
        fldName: 'StoreName',
      },
      {
        label: 'Product Name',
        fldName: 'ProductName',
      },
      {
        label: 'Qty',
        fldName: 'Qty',
        sum: true,
      },
      {
        label: 'Packing',
        fldName: 'Packing',
      },
      {
        label: 'KGs',
        fldName: 'KGs',
        sum: true,
      },

    ],
  }
};

export const DeliveryFrom = {
  title: 'Add Support Ticket ',
  tableName: 'supporttickets',
  pk: 'support_id',
  columns: [

    AddInputFld('CustomerName', 'Customer Name',4,false,'text', {
      readonly: true
    } ),
    AddInputFld('InvoiceID', 'Bill No',4,false,'text', {
      readonly: true
    } ),
    AddInputFld('Gate', 'Bill No',4,false,'text', {
      readonly: true
    } ),

    {
      fldName: 'CustomerName',
      control: 'input',
      label: 'Document',
      size: 12,
    },

    {
      fldName: 'parent_id',
      control: 'input',
      type: 'hidden',
      label: '',
      size: 4,
    },
    {
      fldName: 'repplied_by',
      control: 'input',
      type: 'hidden',
      label: '',
      size: 4,
    },
    {
      fldName: 'opened_by',
      control: 'input',
      type: 'hidden',
      label: '',
      size: 4,
    },
    {
      fldName: 'is_read',
      control: 'input',
      type: 'hidden',
      label: '',
      size: 4,
    },
    {
      fldName: 'status',
      control: 'input',
      type: 'hidden',
      label: '',
      size: 4,
    },

  ],

};

