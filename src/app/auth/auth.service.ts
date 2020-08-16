import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { SystemConstant } from '../shared/constants/system.constant';

export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticate() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return !!user.token;
      } else {
        return false;
      }
    }));
  }
  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }
  get token() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.token;
      } else {
        return null;
      }
    }));
  }
  get fetchedToken() {
    let fetchedToken: string;
    this.token.subscribe(token => {
      fetchedToken = token;
    });
    return fetchedToken;
  }
  constructor(private http: HttpClient) { }
  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }
  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
          userRole: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime,
          parsedData.userRole
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }
  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }
  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      { email: email, password: password, returnSecureToken: true }).pipe(tap(this.setUserData.bind(this)));
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
      { email: email, password: password, returnSecureToken: true }).pipe(tap(this.setUserData.bind(this)));;
  }
  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({ key: 'authData' });
  }
  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
    const user = new User(userData.localId, userData.email, userData.idToken, expirationTime, SystemConstant.UserRole.customer);
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email, user.userRole);
  }
  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, email: string, userRole: string) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email,
      userRole: userRole
    });
    Plugins.Storage.set({ key: 'authData', value: data });
  }
}
