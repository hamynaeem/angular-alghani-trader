import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';

export function TableSetting(cols: any[]) {
  const stngs = {
    selectMode: 'single', // single|multi
    hideHeader: false,
    hideSubHeader: false,
    mode: 'internal',
    actions: {
      columnTitle: 'Actions',
      add: false,
      edit: true,
      delete: true,
      position: 'right', // left|right
    },
    edit: {
      editButtonContent: '<i class="fa fa-pencil mr-3 text-primary"></i>',
      saveButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>',
      confirmSave: true,
    },
    add: {
      addButtonContent:
        '<h4 class="mb-1"><i class="fa fa-plus ml-3 text-success"></i></h4>',
      createButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="fa fa-trash-o text-danger"></i>',
      confirmDelete: true,
    },
    noDataMessage: 'No data found',
    columns: {},
    pager: {
      display: true,
      perPage: 10,
    },
  };

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < cols.length; i++) {
    stngs.columns[cols[i].fldname] = { title: cols[i].title, type: 'string' };
  }

  return stngs;
}
export function RoundTo2(num) {
  return RoundTo(num, 2);
}
export function RoundTo(num: number, dgt: number) {
  return (
    Math.round((num * 1 + Number.EPSILON) * Math.pow(10, dgt)) /
    Math.pow(10, dgt)
  );
}

export function getCurDate() {
  return JSON.parse(localStorage.getItem('currentUser') || '{}').date;
}

export function getCurrentTime(tim = null) {
  return (
    new Date().getHours() +
    ':' +
    (new Date().getMinutes() + 1) +
    ':' +
    new Date().getSeconds()
  );
}
export function getYMDDate(dte: any = null) {
  let d = new Date();
  if (dte) {
    d = dte;
  }
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1, 2, '0') +
    '-' +
    pad(d.getDate(), 2, '0')
  );
}
export function getDMYDate(dte: Date | null = null) {
  let d = new Date();
  if (dte) {
    d = dte;
  }
  return d.getDate() + '-' + (1 + d.getMonth()) + '-' + d.getFullYear();
}

export function JSON2Date(d) {
  return d.year + '-' + d.month + '-' + d.day;
}

export function GetDateJSON(dte: Date | null = null) {
  let d = new Date(
    JSON.parse(localStorage.getItem('currentUser') || '{}').date
  );
  if (dte) {
    d = dte;
  }
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

export function GetProps(source: any, props: any): any {
  let v: any = {};
  for (let i = 0; i < props.length; i++) {
    v[props[i]] = source[props[i]];
  }
  return v;
}
export function getMonthList() {
  return [
    {
      monthno: 1,
      month: 'January',
    },
    {
      monthno: 2,
      month: 'February',
    },
    {
      monthno: 3,
      month: 'March',
    },
    {
      monthno: 4,
      month: 'April',
    },
    {
      monthno: 5,
      month: 'May',
    },
    {
      monthno: 6,
      month: 'June',
    },
    {
      monthno: 7,
      month: 'July',
    },
    {
      monthno: 8,
      month: 'August',
    },
    {
      monthno: 9,
      month: 'September',
    },
    {
      monthno: 10,
      month: 'October',
    },
    {
      monthno: 11,
      month: 'November',
    },
    {
      monthno: 12,
      month: 'December',
    },
  ];
}
export function FindTotal(data, fld) {
  const sum = data.reduce(
    (a, b) => parseFloat(a) + (b[fld] == null ? 0 : parseFloat(b[fld])),
    0
  );
  return sum;
}

export function getYears() {
  const years: any = [];
  for (
    let i = new Date().getFullYear() - 1;
    i < new Date().getFullYear() + 3;
    i++
  ) {
    years.push(i);
  }
  return years;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function formatNumber(
  price: any,
  digits = 0,
  thoSeperator = ',',
  decSeperator = '.',
  bdisplayprice = false
) {
  var i;
  digits = typeof digits === 'undefined' ? 2 : digits;
  bdisplayprice = typeof bdisplayprice === 'undefined' ? true : bdisplayprice;
  thoSeperator = typeof thoSeperator === 'undefined' ? '.' : thoSeperator;
  decSeperator = typeof decSeperator === 'undefined' ? ',' : decSeperator;
  price = (price || 0).toString();
  var _temp = price.split('.');
  var dig = digits > 0 && typeof _temp[1] === 'undefined' ? '00' : _temp[1];
  if (bdisplayprice && parseInt(dig, 10) === 0) {
    dig = '-';
  } else if (digits > 0) {
    dig = dig.toString();
    if (dig.length > digits) {
      dig = Math.round(
        parseFloat('0.' + dig) * Math.pow(10, digits)
      ).toString();
    }
    for (i = dig.length; i < digits; i++) {
      dig += '0';
    }
  }
  var num = _temp[0];
  if (num == '') num = '0';
  var s = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  /*
  var s = "",
      ii = 0,
      last_char=(num && num[0] == '-' ? 0 : -1);
     debugger;
  for (i = num.length - 1; i > last_char; i--) {
      s = ((ii++ % 3 === 2 && num.length-1-ii-last_char > 0) ? ((i > 0) ? thoSeperator : "") : "") + num.substr(i, 1) + s;
  }
  */

  if (digits > 0) s = s + decSeperator + dig;

  //return (num[0] == '-' ? '-' : '') + s;
  return s;
}

export function GetFilter(fltr: any) {
  let filter = ' 1 = 1 ';
  const props = Object.keys(fltr);
  props.forEach((p) => {
    filter += ' and ' + p + " = '" + fltr[p] + "'";
  });
  return filter;
}
export function GetFilterFld(fldName, value) {
  if (value && value != '') return ' and ' + fldName + ' = ' + value;
  else return '';
}
export function GroupBy(array, key) {
  return array.reduce(
    (objectsByKeyValue, obj) => ({
      ...objectsByKeyValue,
      [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj),
    }),
    {}
  );
}
export class Deferred {
  promise: Promise<any>;

  resolve: any;
  reject: any;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export function datediff(first, second) {
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}
export function AddDate(date: Date, days: number) {
  let newDate = new Date(date);

  newDate.setDate(newDate.getDate() + days);

  return newDate;
}
export function GetDate(dte: Date | null = null) {
  if (dte == null) dte = new Date();

  return moment(dte).format('YYYY-MM-DD');
}
export function DateFirst() {
  let newDate = new Date();

  newDate.setDate(1);
  console.log(newDate);

  return moment(newDate).format('YYYY-MM-DD');
}

export function replaceSubstring(
  originalString: string,
  startIndex: number,
  length: number,
  newString: string
): string {
  // Edge cases handling
  if (startIndex < 0 || startIndex >= originalString.length) {
    throw new Error('Start index is out of bounds.');
  }
  if (length < 0) {
    throw new Error('Length cannot be negative.');
  }

  // Determine the end index
  const endIndex = Math.min(startIndex + length, originalString.length);

  // Build the new string
  const before = originalString.substring(0, startIndex);
  const after = originalString.substring(endIndex);

  return before + newString + after;
}

export function FirstDayOfMonth() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return moment(firstDayOfMonth).format('YYYY-MM-DD');
}
export function ExportPDF(
  cols: any,
  data: any,
  title: string,
  subtitle: string
) {
  const columns = cols.Columns.map((col) => col.label);
  const rows = data.map((item) => {
    return cols.Columns.map((col) => item[col.fldName]);
  });

  const doc = new jsPDF('p', 'mm', 'a4');
  const BData = JSON.parse(localStorage.getItem('currentUser') || '{}').bdata;


  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(BData.BusinessName, 105, 10, {
    align: 'center',
  });
  doc.setFontSize(10);
  doc.text(
    BData.Address + ', ' + BData.City,
    105,
    15,
    {
      align: 'center',
    }
  );




  doc.text('Tel: ' + BData.Phone, 105, 20, {
    align: 'center',
  });
  doc.setFontSize(16);
  doc.text(title, 105, 27, {
    align: 'center',
  });

  doc.setFontSize(12);
  doc.text(
    subtitle,
    105,
    32,
    {
      align: 'center',
    }
  );

  doc.setFontSize(8);
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 35,
    margin: { top: 5, left: 3, right: 3, bottom: 12 },
    styles: {
      cellPadding: 0.5,
      overflow: 'linebreak',
      fontSize: 8,
      lineWidth: 0.25, // Thinner border for inner cells
      lineColor: [0, 0, 0], // Black border for inner cells
      textColor: [0, 0, 0], // Black text color for inner cells
    },
    headStyles: {
      fillColor: [200, 200, 200], // Light gray background for header
      textColor: [0, 0, 0], // Black text color
      fontStyle: 'bold', // Bold text in header
      fontSize: 10, // Larger font size for header
      lineWidth: 0.25, // Thinner border for header
      lineColor: [0, 0, 0], // Black border for header
    },
    tableLineWidth: 0.25, // Thinner outer table border
    tableLineColor: [0, 0, 0], // Black outer border
    didDrawPage: function (data) {
      // Footer
      const pageCount = doc.internal.pages.length;
      doc.setFontSize(10);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        {
          align: 'center',
        }
      );
    },
  });
  // doc.save();

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}


export function titleCaseToWords(str) {
  // Add space before capital letters (except the first one)
  // Then capitalize the first letter of the resulting string
  return str.replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(match) { return match.toUpperCase(); })
            .trim();
}
