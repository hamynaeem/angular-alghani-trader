import { formatNumber } from '../../../factories/utilities';
export const ExpenseSetting = {
  Columns: [
    {
      label: 'Expense No',
      fldName: 'ExpendID',
    },
    {
      label: 'Date',
      fldName: 'Date',
    },
    {
      label: 'Head Name',
      fldName: 'Head',
    },
    {
      label: 'Description',
      fldName: 'Desc',
    },

    {
      label: 'Amount',
      fldName: 'Amount',
      sum: true,
      valueFormatter: (d) => {
        return formatNumber(d['Amount']);
      },
    },


    {
      label: 'Status',
      fldName: 'Posted',
    },
  ],
  Actions: [
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

  ],
  Data: [],
};
