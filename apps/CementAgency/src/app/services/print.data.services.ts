import { Injectable } from "@angular/core";

@Injectable()
export class PrintDataService {
  public PrintData: any = {};

  public getTitle(cols: any) {
    const colArr:any = [];
    Object.keys(cols).forEach(k => {
      colArr.push(cols[k].title);
    });
    return colArr;

  }
}

