import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jsPDF, { TableConfig } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import { FindTotal } from '../../../../../libs/future-tech-lib/src/lib/utilities/utilities';

import { environment } from '../../environments/environment';
import { months } from '../factories/constants';
import { RoundTo } from '../factories/utilities';

@Injectable({
  providedIn: 'root',
})
export class PrintBillService {
  private doc: any;
  billW = 135;
  nPageW = 210;
  nPageH = 210;
  constructor(private http: HttpClient) {}

  GetDefaultOptions(doc): any {
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const tableWidth = this.billW; // Desired width of the table in mm
    const leftMargin = (pageWidth - tableWidth) / 2;
    return {
      margin: { left: leftMargin }, // Set the left margin for horizontal centering
      tableWidth: tableWidth,
      theme: 'plain',
      styles: {
        overflow: 'linebreak',
        textColor: [0, 0, 0], // Set font color to black (RGB: [0, 0, 0])
      },
      headStyles: {
        textColor: [0, 0, 0], // Set header font color to black
        fontStyle: 'bold', // Set header font weight to bold
      },
    };
  }

  async PrintUrduBill() {
    const fontData = await this.http
      .get('../../assets/fonts/DroidKufi-Regular.ttf', {
        responseType: 'arraybuffer',
      })
      .subscribe((fontData) => {
        const doc = new jsPDF();
        const fontBase64 = btoa(
          String.fromCharCode.apply(null, new Uint8Array(fontData))
        );
        doc.addFileToVFS('DroidKufi-Regular.ttf', fontBase64);
        doc.addFont('DroidKufi-Regular.ttf', 'DroidKufi', 'regular');
        console.log(doc.getFontList());

        // Set font size and add text
        doc.setFontSize(16);
        doc.text('Hello, World!', 10, 10); // English
        doc.setFont('DroidKufi', 'regular');

        doc.text('پاکستان زندہ باد!', 110, 20, { align: 'right' }); // Japanese
        // Save the PDF
        // doc.save('unicode-pdf.pdf');
        let win = window.open(
          doc.output('bloburl'),
          'Print',
          'width=600,height=800,screenX=50,left=50,screenY=50,top=50,status=no,menubar=no'
        )!;
      });
  }

  PrintPDFBill_A5(data: any) {
    console.log(data);

    this.http
      .get('../../assets/fonts/DroidKufi-Regular.ttf', {
        responseType: 'arraybuffer',
      })
      .subscribe((fontData) => {
        const doc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [210, 210],
        });

        const fontBase64 = btoa(
          String.fromCharCode.apply(null, new Uint8Array(fontData))
        );
        doc.addFileToVFS('DroidKufi-Regular.ttf', fontBase64);
        doc.addFont('DroidKufi-Regular.ttf', 'DroidKufi', 'regular');

        doc.setFontSize(12);
        doc.setFont('Helvetica', 'Bold');
        let y = 4;
        let midX = this.nPageW / 2;

        y = 10;
        doc.text(data.Business.BusinessName, midX, y, { align: 'center' });
        y += 5;
        doc.setFontSize(8);
        doc.text(data.Business.Address, midX, y, { align: 'center' });

        y += 8;
        doc.text(data.DtCr == 'CR' ? 'Sale Invoice' : 'Sale Return', midX, y, {
          align: 'center',
        });

        y += 6;
        doc.setFontSize(9);

        let tableOption: TableConfig = this.GetDefaultOptions(doc);
        autoTable(doc, {
          body: [
            [
              'Customer Name:',
              data.CustomerName,
              'Invoice No',
              this.FormatDate(data.InvoiceID),
            ],
            ['Walk In Customer:', data.CustName, 'Invoice Date', data.Date],
            ['Address:', data.Address, 'Invoice Time', data.Time],
            ['City:', data.City, 'Customer ID', data.CustomerID],
          ],
          startY: y,
          ...tableOption,
          tableLineColor: [255, 255, 255], // Set table border color to white (if you want to ensure it's invisible)
          tableLineWidth: 0, // Ensure table borders are invisible
          styles: {
            lineWidth: 0, // Set a thin line width for the borders
            halign: 'left', // Align text to the left
            valign: 'middle', // Vertically align text in the middle
            cellPadding: 1, // Set minimal padding
            fontSize: 9,
            textColor: [0, 0, 0], // Set font color to black (RGB: [0, 0, 0])
          },
          columnStyles: {
            0: { cellWidth: 30 }, // Fixed width for the first column
            1: { cellWidth: 'auto' }, // Auto width for the second column
            2: { cellWidth: 30 }, // Fixed width for the third column
            3: { cellWidth: 30 }, // Auto width for the fourth column
          },
          didDrawPage: (d: any) => {
            y = d.cursor.y;
          },
          didDrawCell: (data) => {
            if (data.column.index === 0 && data.row.index === 0) {
              // First cell in the first row (Name column, first row)
              doc.setFont('Helvetica', 'bold'); // Set font to bold
            }
          },
        });

        y += 4;
        let billBody = [
          ['S#', 'Product Name', 'Qty', 'Pkng', 'Kgs', 'Lbr', 'Rate', 'Amount'],
        ];
        let idx: any = 0;
        data.details.forEach((d) => {
          billBody.push([
            String(++idx),
            d.ProductName + '|' + d.ProductName2,
            RoundTo(d.Qty, 0).toString(),
            RoundTo(d.Packing, 0).toString(),
            RoundTo(d.KGs, 1).toString() == '0'
              ? ''
              : RoundTo(d.KGs, 1).toString(),
            RoundTo(d.Labour, 0).toString(),
            RoundTo(d.SPrice, 1).toString(),
            RoundTo(d.Amount, 0).toString(),
          ]);
        });
        billBody.push([
          '',
          'Weight:' +
            RoundTo(FindTotal(data.details, 'Weight') / 40, 2) +
            '    Grand Total:',
          RoundTo(FindTotal(data.details, 'Qty'), 0).toString(),
          '',
          RoundTo(FindTotal(data.details, 'KGs'), 0).toString(),
          RoundTo(FindTotal(data.details, 'Labour'), 0).toString(),
          '',
          RoundTo(FindTotal(data.details, 'Amount'), 0).toString(),
        ]);

        autoTable(doc, {
          ...tableOption,
          body: billBody,
          tableLineWidth: 0.5,
          tableLineColor: [0, 0, 0],
          headStyles: {
            textColor: [0, 0, 0], // Text color for the header row
            fontStyle: 'bold', // Font style for the header row
            halign: 'center', // Horizontal alignment for the header text
          },
          columnStyles: {
            0: {
              halign: 'center',
              cellWidth: 6,
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
            1: {
              halign: 'left',
              cellWidth: 'auto',
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
            2: {
              halign: 'center',
              cellWidth: 10,
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
            3: {
              halign: 'center',
              cellWidth: 10,
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
            4: {
              halign: 'center',
              cellWidth: 8,
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
            5: {
              halign: 'right',
              cellWidth: 12,
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
            6: {
              halign: 'right',
              cellWidth: 14,
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
            7: {
              halign: 'right',
              cellWidth: 14,
              textColor: [0, 0, 0],
              fontSize: 9,
              cellPadding: 1,
            },
          },
          didDrawCell: function (data) {
            const doc = data.doc;
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            if (data.column.index == 1) {
              doc.setFillColor(255, 255, 255);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                'F'
              );

              let text = data.cell.text.toString().split('|');
              doc.text(
                text[0],
                data.cell.x,
                data.cell.y + data.cell.height / 2 + doc.getFontSize() / 2 - 3,
                { align: 'left' }
              );

              if (text[1]) {
                doc.setFont('DroidKufi', 'regular');

                doc.text(
                  text[1],
                  data.cell.x + data.cell.width,
                  data.cell.y +
                    data.cell.height / 2 +
                    doc.getFontSize() / 2 -
                    3,
                  { align: 'right' }
                );
                console.log(text[1]);
              }
            }
            doc.setFont('Helvetica', 'normal');
            const isLastRow =
              data.row.index === data.table.body.length - 1 ||
              data.row.index == 0;
            if (isLastRow) {
              // Set the font to bold
              doc.setFont('Helvetica', 'bold');
              doc.setFontSize(9);
              // Clear the original cell content
              doc.setFillColor(255, 255, 255);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                'F'
              );

              // Redraw the cell text in bold
              doc.text(
                data.cell.text,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2 + doc.getFontSize() / 2 - 3,
                { align: 'center' }
              );

              // Optionally, reset the font for other rows
              doc.setFont('Helvetica', 'normal');
            }

            // Border styling for each cell
            doc.setLineWidth(0.2);
            doc.setDrawColor('black');
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height
            );
          },
          startY: y,
          // Default for all columns
          rowPageBreak: 'auto',
          bodyStyles: { valign: 'top' },
          didDrawPage: (d: any) => {
            y = d.cursor.y;
          },
        });

        //Invoice Total Section
        y += 4;
        autoTable(doc, {
          ...tableOption,
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.0,
          body: [
            [
              'Prev Balance:',
              data.PrevBalance,
              '',
              'Packing Charges:',
              data.PackingCharges,
            ],
            [
              'This Bill:',
              data.NetAmount,
              '',
              'Delivery Charges:',
              data.DeliveryCharges,
            ],
            ['Cash Received:', data.AmntRecvd, '', 'Labour:', data.Labour],
            [
              'Total Balance:',
              data.PrevBalance * 1 + 1 * data.NetAmount - data.AmntRecvd,
              '',
              'Discount',
              data.Discount,
            ],
            ['', '', '', 'Net Amount', data.NetAmount],
          ],
          startY: y,

          styles: {
            lineColor: [0, 0, 0], // Black lines
            lineWidth: 0.0, // Line width
            halign: 'left',
            valign: 'middle',
            cellPadding: 1,
          },

          columnStyles: {
            0: { cellWidth: 30, halign: 'left' },
            1: { cellWidth: 25, halign: 'right' },
            2: { cellWidth: 'auto', halign: 'right' },
            3: { cellWidth: 35, halign: 'left' },
            4: { cellWidth: 25, halign: 'right' },
          },
          didDrawPage: (d: any) => {
            y = d.cursor.y;
          },
          didDrawCell: (data) => {
            if (data.row.index === data.table.body.length - 1) {
              doc.setFont('Helvetica', 'bold');
              doc.setFillColor(255, 255, 255);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                'F'
              );

              if (data.column.index == 1 || data.column.index == 4) {
                doc.text(
                  data.cell.text,
                  data.cell.x + data.cell.width,
                  data.cell.y +
                    data.cell.height / 2 +
                    doc.getFontSize() / 2 -
                    3,
                  { align: 'right' }
                );
              } else {
                doc.text(
                  data.cell.text,
                  data.cell.x,
                  data.cell.y +
                    data.cell.height / 2 +
                    doc.getFontSize() / 2 -
                    3,
                  { align: 'left' }
                );
              }
            }
          },
        });

        doc.setFont('Helvetica', 'normal');
        // y += 2;
        doc.setFontSize(9);
        doc.text(
          'Notes:' + data.Notes,
          this.GetDefaultOptions(doc).margin.left + 1,
          y
        );

        y +=4;
        // doc.setFont('DroidKufi', 'regular');

        // doc.text('صلطان آئل ۱۰ کلو!', this.GetDefaultOptions(doc).margin.left + 1,
        // y, {align: 'right'}); // Japanese

        doc.autoPrint();
        // window.open(doc.output('bloburl'), '_blank');
        let win = window.open(
          doc.output('bloburl'),
          'Print',
          'width=500,height=300,screenX=50,left=50,screenY=50,top=50,status=no,menubar=no'
        )!;

        win.addEventListener('afterprint', function () {
          win.close();
        });
      });
  }
  PrintGatePass_A5(data: any) {
    console.log(data);

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [this.nPageW, this.nPageH],
    });

    let defaultOptions = this.GetDefaultOptions(doc);

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'Bold');
    let y = 4;
    let midX = this.billW / 2;
    let x = (this.nPageW - this.billW) / 2;
    midX += x;

    y = 10;
    doc.text(data.Business.BusinessName, midX, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text(data.Business.Address, midX, y, { align: 'center' });

    y += 4;
    doc.text(data.DtCr == 'CR' ? 'Gate Pass' : 'Gate Pass Return', midX, y, {
      align: 'center',
    });

    y += 4;
    autoTable(doc, {
      body: [
        [
          'Customer Name:',
          data.CustomerName,
          'Invoice No',
          this.FormatDate(data.InvoiceID),
        ],
        ['Walk In Customer:', data.CustName, 'Invoice Date', data.Date],
        ['Address:', data.Address, 'Invoice Time', data.Time],
        ['City:', data.City, 'Customer ID', data.CustomerID],
      ],
      startY: y,
      ...defaultOptions,
      tableLineColor: [255, 255, 255], // Set table border color to white (if you want to ensure it's invisible)
      tableLineWidth: 0, // Ensure table borders are invisible
      styles: {
        lineWidth: 0, // Set a thin line width for the borders
        halign: 'left', // Align text to the left
        valign: 'middle', // Vertically align text in the middle
        cellPadding: 1, // Set minimal padding
        fontSize: 9,
        textColor: [0, 0, 0], // Set font color to black (RGB: [0, 0, 0])
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Fixed width for the first column
        1: { cellWidth: 'auto' }, // Auto width for the second column
        2: { cellWidth: 30 }, // Fixed width for the third column
        3: { cellWidth: 30 }, // Auto width for the fourth column
      },
      didDrawPage: (d: any) => {
        y = d.cursor.y;
      },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.row.index === 0) {
          // First cell in the first row (Name column, first row)
          doc.setFont('Helvetica', 'bold'); // Set font to bold
        }
      },
    });

    y += 4;
    let billBody = [['S#', 'Product Name', 'Qty', 'Pkng', 'Kgs']];
    let idx: any = 0;
    data.details.forEach((d) => {
      billBody.push([
        String(++idx),
        d.ProductName,
        RoundTo(d.Qty, 0).toString(),
        RoundTo(d.Packing, 0).toString(),
        RoundTo(d.KGs, 1).toString(),
      ]);
    });

    billBody.push([
      '',
      'Total Weight:' +
        RoundTo(FindTotal(data.details, 'Weight') / 40, 2) +
        '      Total Items:',
      RoundTo(FindTotal(data.details, 'Qty'), 0).toString(),
      '',
      RoundTo(FindTotal(data.details, 'KGs'), 0).toString(),
    ]);
    autoTable(doc, {
      body: billBody,
      ...defaultOptions,
      startY: y,
      tableLineWidth: 0.25,
      tableLineColor: [111, 111, 111],
      headStyles: {
        fillColor: [200, 200, 200], // Background color for the header row
        textColor: [0, 0, 0], // Text color for the header row
        fontStyle: 'bold', // Font style for the header row
        halign: 'center', // Horizontal alignment for the header text
      },
      columnStyles: {
        0: {
          halign: 'center',
          cellWidth: 6,
          textColor: [0, 0, 0],
          fontSize: 9,
          cellPadding: 1,
        },
        1: {
          halign: 'left',
          cellWidth: 'auto',
          textColor: [0, 0, 0],
          fontSize: 9,
          cellPadding: 1,
        },
        2: {
          halign: 'center',
          cellWidth: 8,
          textColor: [0, 0, 0],
          fontSize: 9,
          cellPadding: 1,
        },
        3: {
          halign: 'center',
          cellWidth: 10,
          textColor: [0, 0, 0],
          fontSize: 9,
          cellPadding: 1,
        },
        4: {
          halign: 'center',
          cellWidth: 8,
          textColor: [0, 0, 0],
          fontSize: 9,
          cellPadding: 1,
        },
      },
      didDrawCell: function (data) {
        // Border styling for each cell

        const isLastRow = data.row.index === data.table.body.length - 1;
        if (isLastRow) {
          // Set the font to bold
          doc.setFont('Helvetica', 'bold');

          // Clear the original cell content
          doc.setFillColor(255, 255, 255);
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            'F'
          );

          // Redraw the cell text in bold
          doc.text(
            data.cell.text,
            data.cell.x + data.cell.padding('left') + data.cell.width / 2,
            data.cell.y + data.cell.height / 2 + doc.getFontSize() / 2 - 3,
            { align: 'center' }
          );

          // Optionally, reset the font for other rows
          doc.setFont('Helvetica', 'normal');
        }

        doc.setLineWidth(0.25);
        doc.setDrawColor('black');
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);

        //doc.addFontStyle('normal');
      },

      // Default for all columns
      rowPageBreak: 'auto',
      bodyStyles: { valign: 'top' },
      didDrawPage: (d: any) => {
        y = d.cursor.y;
      },
    });

    //Invoice Total Section

    y += 8;
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');

    doc.text(data.StoreName, x + 10, y + 5);

    doc.setLineWidth(0.3);

    doc.rect(x + 6, y - 2, x + 42, 12);

    doc.autoPrint();
    // window.open(doc.output('bloburl'), '_blank');
    let win = window.open(
      doc.output('bloburl'),
      'Print',
      'width=500,height=300,screenX=50,left=50,screenY=50,top=50,status=no,menubar=no'
    )!;

    win.addEventListener('afterprint', function () {
      win.close();
    });
    return doc;
  }

  PrintPDFBill_80MM(data: any) {
    console.log(data);

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [72, 1000],
    });
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'Bold');
    let y = 4;
    let midX = this.billW / 2;
    let x = 2;

    var imageUrl = environment.UPLOADS_URL + 'jamrt-logo.png'; // Replace this with your image URL

    // Add the image to the PDF
    doc.addImage(imageUrl, 'PNG', 1, 1, 70, 32);
    y = 30;
    // doc.text(data.Business.BusinessName, midX, y, { align: 'center' });
    // y += 5;
    // doc.setFontSize(8);
    // doc.text(data.Business.Address, midX, y, { align: 'center' });

    y += 8;
    doc.text('Sale Invoice', midX, y, { align: 'center' });
    y += 6;
    doc.setFont('Helvetica', '');
    doc.setFontSize(8);
    doc.text(
      'Date:' + moment(data.Date).format('DD-MM-YY') + ' ' + data.Time,
      x,
      y,
      { align: 'left' }
    );
    doc.text('Bill No:' + (data.InvoiceID || ''), this.billW - 3, y, {
      align: 'right',
    });
    y += 5;

    doc.setFont('Helvetica', '', 700);
    doc.text('Customer Name: ' + data.CustomerName, x, y, { align: 'left' });
    y += 4;
    doc.setFont('Helvetica', 'normal');
    doc.text('Address: ' + data.Address, x, y, { align: 'left' });
    y += 4;

    doc.text('Phone No: ' + data.PhoneNo1, x, y, { align: 'left' });
    y += 4;

    let billBody = [['Qty', 'Item', ' ', 'Amount']];

    data.details.forEach((d) => {
      billBody.push([
        RoundTo(d.Pcs, 1).toString(),
        d.ProductName + ' ' + d.Remarks,
        ' ',
        RoundTo(d.NetAmount, 0).toString(),
      ]);
    });

    autoTable(doc, {
      body: billBody,
      tableLineWidth: 0.3,
      tableLineColor: [0, 0, 0],
      columnStyles: {
        0: {
          halign: 'center',
          cellWidth: 8,
          textColor: [0, 0, 0],
          fontSize: 8,

          cellPadding: 0.5,
        },
        1: {
          halign: 'left',
          cellWidth: 38,
          textColor: [0, 0, 0],
          fontSize: 8,

          cellPadding: 0.5,
        },
        2: {
          halign: 'right',
          cellWidth: 6,
          textColor: [0, 0, 0],
          fontSize: 8,
          cellPadding: 0.5,
        },
        3: {
          halign: 'right',
          cellWidth: 18,
          textColor: [0, 0, 0],
          fontSize: 7,
          cellPadding: 0.5,
        },
      },
      didDrawCell: function (data) {
        // Border styling for each cell

        doc.setLineWidth(0.3);
        doc.setDrawColor('black');

        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
        //doc.addFontStyle('normal');
      },
      startY: y,
      margin: 1,
      tableWidth: this.billW,
      theme: 'grid',

      // Default for all columns
      rowPageBreak: 'auto',
      bodyStyles: { valign: 'top' },
      didDrawPage: (d: any) => {
        y = d.cursor.y;
      },
    });
    y += 8;
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('Total Items: ' + (billBody.length - 1), x + 2, y);

    doc.text('Thanks for', x + 2, y + 5);
    doc.text('your visit', x + 2, y + 10);

    doc.setFont('Helvetica', '', 700);
    doc.setFontSize(10);
    doc.text('Total Bill: ', x + 26, y);
    //doc.textAlign('right');
    doc.text(RoundTo(data.Amount, 2) + '', this.billW - x - 2, y, {
      align: 'right',
    });
    y += 6;

    doc.setLineWidth(0.3);

    doc.rect(27, y - 11, x + 42, 8);

    // doc.setFontSize(8);
    // doc.text('UserName: ' + data.UserName, x, y + 4);

    doc.rect(2, y + 20, this.billW, 1);

    doc.autoPrint();
    // window.open(doc.output('bloburl'), '_blank');
    let win = window.open(
      doc.output('bloburl'),
      'Print',
      'width=400,height=300,screenX=50,left=50,screenY=50,top=50,status=no,menubar=no'
    )!;

    win.addEventListener('afterprint', function () {
      win.close();
    });

    return doc;
  }

  PrintBill(data) {
    this.doc = window.open(
      '',
      'Print',
      'width=400,height=300,screenX=50,left=50,screenY=50,top=50,status=no,menubar=no'
    )!;

    this.doc.document.open();

    this.addTag('<div style="width:80mm; border-style:solid;">');
    this.addDIv(`${data.Business.BusinessName}`);
    this.addDIv(`${data.Business.Address}`);
    // this.addTag(`<h5><br></h5> `);
    // this.addTag(`<h4>Cash Memo</h4></center>`);

    this.addTag('</div>');

    this.doc.document.close();
    setTimeout(() => {
      this.doc.print();
      this.doc.close();
    }, 500);
  }

  addTag(html: string) {
    this.doc.document.write(html);
  }
  addDIv(html, style = '') {
    this.addTag(
      '<div' +
        (style == '' ? '' : 'style ="' + style + '"') +
        '>' +
        html +
        '</div>'
    );
  }
  printTest() {
    // Assuming you have imported the jsPDF library and the autoTable plugin

    // Create a new jsPDF instance
    var doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [80, 210], // 80mm width, 210mm height (A4 in landscape)
    });

    // Set the properties for the table
    var columns = ['Column 1', 'Column 2', 'Column 3'];
    var data = [
      ['Row 1 Cell 1', 'Row 1 Cell 2', 'Row 1 Cell 3'],
      ['Row 2 Cell 1', 'Row 2 Cell 2', 'Row 2 Cell 3'],
      ['Row 3 Cell 1', 'Row 3 Cell 2', 'Row 3 Cell 3'],
    ];

    var margin = {
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
    };

    // Set font style
    var fontSize = 8;
    doc.setFontSize(fontSize);

    // Create table
    autoTable(doc, {
      startY: margin.top,
      head: [columns],
      body: data,
      theme: 'grid',
      styles: {
        cellPadding: 1,
        fontSize: fontSize,
        lineWidth: 0.5,
      },
      margin: {
        top: margin.top,
        bottom: margin.bottom,
        left: margin.left,
        right: margin.right,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Adjust column widths as needed
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
      },
      didDrawCell: function (data) {
        // Border styling for each cell

        doc.setLineWidth(0.5);
        doc.setDrawColor('black');

        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
        //doc.addFontStyle('normal');
      },
    });

    // Save the PDF
    doc.save('table.pdf');
  }
  FormatDate(date: string) {
    const m = date.substring(2, 4);
    return date.slice(0, 2) + months[Number(m) - 1].Month + date.slice(4);
  }
}
