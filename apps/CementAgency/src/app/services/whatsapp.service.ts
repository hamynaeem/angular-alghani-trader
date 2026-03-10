import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface WhatsAppMessage {
  mobile: string;
  message: string;
}

export interface WhatsAppResult {
  success: boolean;
  results: {
    success: { mobile: string; messageId: string }[];
    failed: { mobile: string; error: string }[];
  };
  quota: any;
}

@Injectable()
export class WhatsAppService {
  private apiUrl = environment.WHIZTEXT_API_URL;
  private apiKey = environment.WHIZTEXT_API_KEY;

  constructor(private http: HttpClient) {}

  sendBulkMessages(messages: WhatsAppMessage[]): Promise<WhatsAppResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    });

    return new Promise((resolve, reject) => {
      this.http
        .post<any>(this.apiUrl, { messages }, { headers })
        .subscribe({
          next: (data) => {
            const results: WhatsAppResult['results'] = {
              success: [],
              failed: [],
            };

            if (data?.results?.details && Array.isArray(data.results.details)) {
              for (const item of data.results.details) {
                if (item.status === 'sent') {
                  results.success.push({
                    mobile: item.mobile ?? null,
                    messageId: item.messageId ?? null,
                  });
                } else {
                  results.failed.push({
                    mobile: item.mobile ?? null,
                    error: item.error ?? 'Unknown error',
                  });
                }
              }
            }

            resolve({
              success: true,
              results,
              quota: data?.quota ?? null,
            });
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }
}
