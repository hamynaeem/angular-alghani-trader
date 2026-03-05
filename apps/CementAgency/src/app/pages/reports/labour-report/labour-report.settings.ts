import { AddInputFld, AddLookupFld } from "../../../../../../../libs/future-tech-lib/src/lib/components/crud-form/crud-form-helper";

export const LabourRptStngs = {
  Checkbox: false,
  Columns: [
    {
      label: 'S No',
      fldName: 'SNo',
    },
    {
      label: 'Invoice No',
      fldName: 'InvoiceID',
    },
    {
      label: 'Date',
      fldName: 'Date',
    },
    {
      label: 'Account Name',
      fldName: 'CustomerName',
    },
    {
      label: 'Description',
      fldName: 'Description',
    },

    {
      label: 'Labour',
      fldName: 'Labour',
      sum: true,

    },

  ],
  Actions: [
    {
      action: "edit",
      title: "Edit",
      icon: "pencil",
      class: "primary",
    },


  ],
  Data: [],
};
export const LabourAddForm={
  title: 'Add Labour',
  tableName : 'labour',
  pk: 'LabourID',
  columns : [
    AddInputFld('Date', 'Date', 4,true,'Date'),
    AddLookupFld('LabourHeadID', 'Labour Head','labourheads','LabourHeadID', 'LabourHead',8,null,true),
    AddInputFld('Description', 'Description', 8,true,'text'),
    AddInputFld('Amount', 'Amount', 4,true,'number'),
  ]

}
