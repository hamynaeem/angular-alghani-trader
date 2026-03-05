
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable()
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(username: any, password: any, date: any, BusinessID:any) {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      const param = { username, password, date, BusinessID };

      this.http
        .post(environment.AUTH_URL + "login/" , param, { headers: headers })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
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
