import { customerTypes } from "./static.data";

export const CustomerForm = {
      title: "Customers",
    tableName: "customers",
    pk: "customer_id",
    columns: [
      {
        fldName: "customer_type",
        control: "select",
        type: "list",
        label: "Customer type",
        listData: customerTypes,
        valueFld: "id",
        displayFld: "type",
        required: true,
        size: 4
      },
      {
        fldName: "customer_name",
        control: "input",
        type: "text",
        label: "Customer Name",
        required: true,
        size: 8
      },
      {
        fldName: "cell_no",
        control: "input",
        type: "text",
        label: "Cell No",
        required: true,
        size: 4
      },
      {
        fldName: "whatsapp_no",
        control: "input",
        type: "text",
        label: "WhatsApp No",
        required: true,
        size: 4
      },
      {
        fldName: "email",
        control: "input",
        type: "email",
        label: "Email",
        size: 4
      },
      {
        fldName: "address",
        control: "input",
        type: "text",
        label: "Address",
        size: 8
      },
      {
        fldName: "nationality_id",
        control: "select",
        type: "lookup",
        label: "Country",
        listTable: 'nationality',
        listData: [],
        valueFld: "nationality_id",
        displayFld: "nationality_name",
        required: true,
        size: 4
      },
    ],
};

export const AddPayment_Form = {
  title: "Add Payment",
tableName: "cash_receipts",
pk: "receipt_id",
columns: [

  {
    fldName: "date",
    control: "input",
    type: "date",
    label: "Date",
    required: true,
    size: 4
  },
  {
    fldName: "invoice_id",
    control: "input",
    type: "text",
    label: "Invoice No",
    readonly: true,
    size: 4
  },

  {
    fldName: "description",
    control: "input",
    type: "text",
    label: "Description",
    required: true,
    size: 8
  },

  {
    fldName: "amount",
    control: "input",
    type: "number",
    label: "Amount",
    size: 4
  },

],
};
export const UnitsForm = {
  form: {
      title: 'Units',
      tableName: 'units',
      pk: 'ID',
      columns: [
          {
              fldName: 'UnitName',
              control: 'input',
              type: 'text',
              label: 'Unit Name'
          },
          {
              fldName: 'Value',
              control: 'input',
              type: 'number',
              label: 'Unit Value'
          },

      ]
  },
  list: {
      tableName: 'units',
      pk: 'ID',
      columns: [
          {
              data: 'ID',
              label: 'ID'
          },
          {
              data: 'UnitName',
              label: 'Unit'
          },
          {
              data: 'Value',
              label: 'Unit Value'
          },

      ]
  }
};
