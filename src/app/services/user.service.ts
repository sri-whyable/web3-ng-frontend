import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  constructor(private http: HttpClient) {
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(environment.server + 'api/auth/user/login', {data})
      .pipe(map((result) => {
        return result.data;
      }));
  }

  authenticate(data: any): Observable<any> {
    return this.http.post<any>(environment.server + 'api/auth/user/authenticate', {data})
      .pipe(map((result) => {
        return result.data;
      }));
  }

  signUp(data: any): Observable<any> {
    return this.http.post<any>(environment.server + 'api/auth/user/signUp', {data})
      .pipe(map((result) => {
        return result.data;
      }));
  }
}
