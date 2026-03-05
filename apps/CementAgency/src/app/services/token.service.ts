import { Injectable } from '@angular/core';

@Injectable()
export class TokenService {
  constructor() { }

  getToken() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')|| "{}");
    if (currentUser && currentUser.token) {
      return currentUser.token;
    } else {
      return '';
    }
  }

  getGroup() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || "{}");
    if (currentUser && currentUser.token) {
      return currentUser.groupid;
    } else {
      return 0;
    }
  }
}
