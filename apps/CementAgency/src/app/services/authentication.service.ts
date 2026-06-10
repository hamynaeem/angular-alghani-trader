
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable()
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(username: any, password: any, date: any, BusinessID:any) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      const param = { username, password, date, BusinessID };

      // Request as text so we can recover when backend returns HTML
      // wrappers or non-JSON content alongside the JSON payload.
      this.http
        .post(environment.AUTH_URL + 'login/', param, { headers: headers, responseType: 'text' as 'json' })
        .subscribe({
          next: (resRaw: any) => {
            try {
              if (typeof resRaw === 'string') {
                const parsed = JSON.parse(resRaw);
                resolve(parsed);
                return;
              }
              resolve(resRaw);
            } catch (ex) {
              // Try to extract JSON array/object from HTML/text
              try {
                const txt = typeof resRaw === 'string' ? resRaw : JSON.stringify(resRaw);
                const firstArr = txt.indexOf('[');
                const lastArr = txt.lastIndexOf(']');
                if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
                  const candidate = txt.substring(firstArr, lastArr + 1);
                  const parsed2 = JSON.parse(candidate);
                  resolve(parsed2);
                  return;
                }
                const firstObj = txt.indexOf('{');
                const lastObj = txt.lastIndexOf('}');
                if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
                  const candidate = txt.substring(firstObj, lastObj + 1);
                  const parsed3 = JSON.parse(candidate);
                  resolve(parsed3);
                  return;
                }
              } catch (ex2) {
                // ignore
              }
              try {
                console.error('AuthenticationService.login: failed to parse response. snippet:',
                  typeof resRaw === 'string' ? resRaw.slice(0, 2000) : JSON.stringify(resRaw).slice(0, 2000));
              } catch (logErr) {}
              resolve(resRaw);
            }
          },
          error: (err) => {
            // Sometimes HttpClient surfaces parse failures as HttpErrorResponse
            // with status === 200 and the raw text in err.error. Try to recover.
            if (err && err.status === 200 && typeof err.error === 'string') {
              try {
                const parsed = JSON.parse(err.error);
                resolve(parsed);
                return;
              } catch (ex) {
                try {
                  const txt = err.error;
                  const f = txt.indexOf('[');
                  const l = txt.lastIndexOf(']');
                  if (f !== -1 && l !== -1 && l > f) {
                    const candidate = txt.substring(f, l + 1);
                    const parsed2 = JSON.parse(candidate);
                    resolve(parsed2);
                    return;
                  }
                  const fo = txt.indexOf('{');
                  const lo = txt.lastIndexOf('}');
                  if (fo !== -1 && lo !== -1 && lo > fo) {
                    const candidate = txt.substring(fo, lo + 1);
                    const parsed3 = JSON.parse(candidate);
                    resolve(parsed3);
                    return;
                  }
                } catch (e2) {
                  // ignore
                }
                try {
                  console.error('AuthenticationService.login: HttpErrorResponse with status 200. snippet:', err.error.slice(0, 2000));
                } catch (logErr) {}
                resolve(err.error);
                return;
              }
            }
            reject(err);
          }
        });
    });
  }

  signup(data) {
    const headers = new HttpHeaders();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    return this.http.post(environment.AUTH_URL + "signup", data, { headers });
  }
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("currentUser");
  }
  setUser(u) {
    localStorage.setItem("currentUser", JSON.stringify(u));
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem("currentUser") || "{}");
  }
  getComputer() {
    const u = this.getUser();
    if (u) {
      return u.computer;
    } else {
      return "";
    }
  }
}
