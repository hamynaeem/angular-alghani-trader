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
      position: 'right' // left|right
    },
    edit: {
      editButtonContent: '<i class="fa fa-pencil mr-3 text-primary"></i>',
      saveButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>',
      confirmSave: true
    },
    add: {
      addButtonContent:
        '<h4 class="mb-1"><i class="fa fa-plus ml-3 text-success"></i></h4>',
      createButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>'
    },
    delete: {
      deleteButtonContent: '<i class="fa fa-trash-o text-danger"></i>',
      confirmDelete: true
    },
    noDataMessage: 'No data found',
    columns: {},
    pager: {
      display: true,
      perPage: 10
    }
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
  return Math.round((num * 1 + Number.EPSILON) * Math.pow(10, dgt)) / Math.pow(10, dgt);
}

export function getCurDate() {
  return JSON.parse(localStorage.getItem('currentUser')|| "{}").date;
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
export function getYMDDate(dte :any = null) {
  let d = new Date();
  if (dte) {
    d = dte;
  }
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2,'0') + '-' +   pad(d.getDate(),2,'0') ;
}
export function getDMYDate(dte: Date | null = null) {
  let d = new Date();
  if (dte) {
    d = dte;
  }
  return d.getDate() + '-' + (1 + d.getMonth()) + '-' + d.getFullYear();
}

export function JSON2Date(d) {
  if (!d) return '';
  // if d already a string or Date-like, return as-is
  if (typeof d === 'string') return d;
  if (d instanceof Date) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2, '0') + '-' + pad(d.getDate(), 2, '0');
  }
  return d.year + '-' + pad(d.month, 2, '0') + '-' + pad(d.day, 2, '0');
}

export function GetDateJSON(dte: Date|null= null) {
  let d = new Date(JSON.parse(localStorage.getItem("currentUser") || "{}").date);
  if (dte) {
    d = dte;
  }
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate()
  };
}

export function GetProps(source:any, props:any): any {
  let v:any = {};
  for(let i = 0; i<props.length; i++){
    v[props[i]] = source[props[i]];
   }
   return v;
}
export function getMonthList() {
  return [
    {
      monthno: 1,
      month: 'January'
    },
    {
      monthno: 2,
      month: 'February'
    },
    {
      monthno: 3,
      month: 'March'
    },
    {
      monthno: 4,
      month: 'April'
    },
    {
      monthno: 5,
      month: 'May'
    },
    {
      monthno: 6,
      month: 'June'
    },
    {
      monthno: 7,
      month: 'July'
    },
    {
      monthno: 8,
      month: 'August'
    },
    {
      monthno: 9,
      month: 'September'
    },
    {
      monthno: 10,
      month: 'October'
    },
    {
      monthno: 11,
      month: 'November'
    },
    {
      monthno: 12,
      month: 'December'
    }
  ];
}
export function FindTotal(data, fld) {
  const sum = data.reduce((a, b) => parseFloat(a) + parseFloat(b[fld]), 0);
  return sum;
}

export function getYears() {
  const years:any = [];
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


export function formatNumber(price, digits=0, thoSeperator=',', decSeperator='.', bdisplayprice=false) {
  var i;
  if (!price) return 0

  digits = typeof digits === "undefined" ? 2 : digits;
  bdisplayprice = typeof bdisplayprice === "undefined" ? true : bdisplayprice;
  thoSeperator = typeof thoSeperator === "undefined" ? "." : thoSeperator;
  decSeperator = typeof decSeperator === "undefined" ? "," : decSeperator;
  price = price.toString();
  var _temp = price.split(".");
  var dig = digits > 0 && typeof _temp[1] === "undefined" ? "00" : _temp[1];
  if (bdisplayprice && parseInt(dig, 10) === 0) {
    dig = "-";
  } else if (digits > 0) {
    dig = dig.toString();
    if (dig.length > digits) {
      dig = Math.round(
        parseFloat("0." + dig) * Math.pow(10, digits)
      ).toString();
    }
    for (i = dig.length; i < digits; i++) {
      dig += "0";
    }
  }
  var num = _temp[0];
  if (num == "") num = "0";
  var s = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

  export function  FormatDate(date) {
      return moment(date).format('DD-MM-YYYY')
    }
