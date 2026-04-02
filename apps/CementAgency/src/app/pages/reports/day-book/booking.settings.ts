export const BookingSetting = {
  Columns: [
    {
      label: "Booking No",
      fldName: "BookingID",
    },
    {
      label: "Date",
      fldName: "Date",
    },
    {
      label: "Description",
      fldName: "Description",
    },
    {
      label: "Supplier Name",
      fldName: "CustomerName",
    },

    {
      label: "Invoice No",
      fldName: "InvoiceNo",
    },
    {
      label: "Vehicle No",
      fldName: "VehicleNo",
    },
    {
      label: "Builty No",
      fldName: "BuiltyNo",
    },
    {
      label: "Amount",
      fldName: "Amount",
      sum: true,

    },
    {
      label: "Discount",
      fldName: "Discount",
      sum: true,

    },
    {
      label: "Carriage",
      fldName: "Carriage",
      sum: true,

    },

    {
      label: "Net Amount",
      fldName: "NetAmount",
      sum: true,

    },
    {
      label: "Received",
      fldName: "Received",
      sum: true,
    },
    {
      label: "Balance",
      fldName: "Balance",
      sum: true,
    },

    {
      label: "Type",
      fldName: "DtCr",
    },
    {
      label: "Status",
      fldName: "Posted",
    },
  ],
  Actions: [
    {
      action: "edit",
      title: "Edit",
      icon: "pencil",
      class: "primary",
    },
    {
      action: "post",
      title: "Post",
      icon: "check",
      class: "warning",
    },
    {
      action: "print",
      title: "Print",
      icon: "print",
      class: "success",
    },
    {
      action: "delete",
      title: "Delete",
      icon: "trash",
      class: "danger",
    },
  ],
  Data: [],
};
