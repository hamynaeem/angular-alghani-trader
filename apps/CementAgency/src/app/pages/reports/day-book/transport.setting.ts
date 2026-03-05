import { formatNumber } from '../../../factories/utilities';

export const TransportSetting = {
  Columns: [
    { label: 'Date', fldName: 'Date' },
    { label: 'Description', fldName: 'Details' },
    { label: 'Income', fldName: 'Income', sum: true, valueFormatter: (d) => formatNumber(d['Income']) },
    { label: 'Expense', fldName: 'Expense', sum: true, valueFormatter: (d) => formatNumber(d['Expense']) },
    {
      label: 'Status',
      fldName: 'Posted',
      badge: true,
      valueFormatter: (d) => {
        const posted = Number(d.IsPosted) === 1 || String(d.IsPosted) === '1';
        const txt = d.Posted || (posted ? 'Posted' : 'Unposted');
        return txt;
      }
    },
  ],
  Actions: [
    { action: 'edit', title: 'Edit', icon: 'pencil', class: 'primary' },
    { action: 'post', title: 'Post', icon: 'check', class: 'warning' },
  ],
  Data: [],
};
