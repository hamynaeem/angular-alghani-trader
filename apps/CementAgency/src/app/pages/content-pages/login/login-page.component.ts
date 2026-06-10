import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { AuthenticationService } from '../../../services/authentication.service';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { OtpInputComponent } from '../otp-input/otp-input.component';
import { ROUTES } from '../../../shared/vertical-menu/vertical-menu-routes.config';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit {
  @ViewChild('otp') otp!: OtpInputComponent;
  loginFormSubmitted = false;
  isLoginFailed = false;
  businesses:any = [];
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    date: new FormControl(GetDateJSON(), [Validators.required]),
    BusinessID: new FormControl('1', [Validators.required]),
    rememberMe: new FormControl(true),
    // Added otp field
  });

  public returnUrl: any;

  constructor(
    private router: Router,
    private http: HttpBase,
    private auth: AuthenticationService,
    private myToaster: MyToastService,
    private route: ActivatedRoute
  ) {}

  get lf() {
    return this.loginForm.controls;
  }

  // On submit button click
  onSubmit() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const businessList: any[] = Array.isArray(this.businesses)
      ? this.businesses
      : (this.businesses && Array.isArray((this.businesses as any).data)
          ? (this.businesses as any).data
          : []);

    let businiess = businessList.find(
      (b: any) => b.BusinessID == this.loginForm.value.BusinessID
    );

    this.auth
      .login(this.loginForm.value.username,
        this.loginForm.value.password,
        JSON2Date(this.loginForm.value.date),
        this.loginForm.value.BusinessID) // Added otp parameter
      .then(
        (res: any) => {
          localStorage.setItem('currentUser', JSON.stringify(res));
          this.myToaster.Sucess('' + res.msg, 'Login', 2);

          this.http
            .getData('usergrouprights?filter=groupid=' + this.http.getUserGroup())
            .then((menu) => {
              console.log('login response:', res);
              console.log('user group rights menu:', menu);
              res['UserMenu'] = menu;
              localStorage.setItem('currentUser', JSON.stringify(res));

              // Determine where to navigate after login
              let destination = this.returnUrl;
              console.log('initial returnUrl:', this.returnUrl);
              if (destination === '/') {
                // Admin (group 1) goes to dashboard; others go to first allowed menu page
                if (Number(res.rights) === 1) {
                  destination = '/dashboard';
                } else {
                  const allowedPageIds = new Set(
                    ((menu as any[]) || []).map((m: any) => Number(m.pageid))
                  );
                  console.log('allowedPageIds', Array.from(allowedPageIds));
                  let firstPath = '/not-allowed';
                  for (const rt of ROUTES) {
                    if (
                      rt.path &&
                      rt.path !== '/dashboard' &&
                      allowedPageIds.has(Number(rt.id))
                    ) {
                      firstPath = rt.path;
                      break;
                    }
                    for (const sub of (rt.submenu || [])) {
                      if (sub.path && allowedPageIds.has(Number(sub.id))) {
                        firstPath = sub.path;
                        break;
                      }
                    }
                    if (firstPath !== '/not-allowed') break;
                  }
                  destination = firstPath;
                }
              }

              console.log('navigating to', destination);
              this.router
                .navigate([destination])
                .then((navRes) => {
                  console.log('router.navigate result:', navRes);
                  if (!navRes) {
                    console.warn('navigation returned false — trying /dashboard fallback');
                    this.router.navigate(['/dashboard']).catch((e) => console.error('fallback nav error', e));
                  }
                })
                .catch((navErr) => {
                  console.error('router.navigate error:', navErr);
                  // fallback
                  this.router.navigate(['/dashboard']).catch((e) => console.error('fallback nav error', e));
                });
            })
            .catch((menuErr) => {
              console.error('failed to load user rights menu', menuErr);
              this.myToaster.Error('Could not load menu. Login partial.', 'Login', 2);
            });
          //   setTimeout(() => {
          //     window.location.replace('/');
          //   }, 3000);

        }).catch(err => {
          console.error('Login error', err);
          let message = 'Login failed';
          try {
            if (err && err.error) {
              if (typeof err.error === 'string') {
                try {
                  const parsed = JSON.parse(err.error);
                  if (parsed && parsed.msg) {
                    message = parsed.msg;
                  } else {
                    const text = err.error.replace(/<[^>]*>/g, '').trim();
                    if (text) message = text;
                  }
                } catch (parseErr) {
                  const text = err.error.replace(/<[^>]*>/g, '').trim();
                  if (text) message = text;
                }
              } else if (err.error.msg) {
                message = err.error.msg;
              } else if (err.error.message) {
                message = err.error.message;
              } else {
                message = JSON.stringify(err.error).slice(0, 200);
              }
            } else if (err && err.message) {
              message = err.message;
            }
          } catch (e) {
            // ignore
          }

          this.myToaster.Error(message, 'Login', 2);
        });

  }
  ngOnInit() {
    console.log('login page');

    this.auth.logout();
    this.http.getData('blist').then((s: any) => {
      // Normalize various possible backend responses into an array
      if (Array.isArray(s)) {
        this.businesses = s;
      } else if (s && Array.isArray(s.data)) {
        this.businesses = s.data;
      } else if (s && Array.isArray(s.rows)) {
        this.businesses = s.rows;
      } else if (typeof s === 'string') {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) this.businesses = parsed;
          else if (parsed && Array.isArray(parsed.data)) this.businesses = parsed.data;
          else this.businesses = [];
        } catch (e) {
          this.businesses = [];
        }
      } else {
        this.businesses = [];
      }
    }).catch(err => {
      console.error('failed to load blist', err);
      this.businesses = [];
    })
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

}
