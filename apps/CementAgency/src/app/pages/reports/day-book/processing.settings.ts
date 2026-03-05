import { formatNumber } from '../../../factories/utilities';
export const ProcessingSettings = {
  Columns: [
    {
      label: "Invoice No",
      fldName: "ProcessID",
    },
    {
      label: "Date",
      fldName: "Date",
    },
    {
      label: "Product Name",
      fldName: "ProductName",
    },
    {
      label: "Weight",
      fldName: "WeightUsed",
    },
    {
      label: "Output",
      fldName: "WeightOutput",
    },
    {
      label: "Posted",
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
      action: "delete",
      title: "Delete",
      icon: "trash",
      class: "danger",
    },

  ],
  Data: [],
};
