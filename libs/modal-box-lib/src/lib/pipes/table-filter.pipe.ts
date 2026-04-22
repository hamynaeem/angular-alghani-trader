import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(Data: any, filterString: string, columns: any): any {
    if (!Data || Data.length === 0 || !filterString || !columns) {
      return Data;
    }
    const lower = filterString.toLowerCase();
    const filteredData: any = [];
    for (const data of Data) {
      for (const col of columns) {
        const val = data[col.fldName];
        if (val !== null && val !== undefined && String(val).toLowerCase().includes(lower)) {
          filteredData.push(data);
          break;
        }
      }
    }
    return filteredData;
  }
}
