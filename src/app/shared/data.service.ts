import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private http: HttpClient
        , private authService: AuthService) {
    }

    // api get method
    get(uri: string) {
        return this.http.get(uri).pipe(map(this.extractData));
    }
    //api post method
    post(uri: string, data?: any) {
        return this.http.post(uri, data).pipe(map(this.extractData));
    }
    // api put method
    put(uri: string, data?: any) {
        return this.http.put(uri, data).pipe(map(this.extractData));
    }
    // api delete method
    delete(uri: string, key: string, id: string) {
        return this.http.delete(uri + "/?" + key + "=" + id).pipe(map(this.extractData));
    }
    // api delete multi
    deleteWithMultiParams(uri: string, params) {
        var paramStr: string = '';
        for (let param in params) {
            paramStr += param + "=" + params[param] + '&';
        }
        return this.http.delete(uri + "/?" + paramStr).pipe(map(this.extractData));

    }
    // api post file method
    // postFile(uri: string, data?: any) {
    //     let newHeader = new HttpHeaders();
    //     newHeader.set("Authorization", "Bearer " + this.authService.token);
    //     return this.http.post(uri, data, { headers: newHeader }).pipe(map(this.extractData));
    // }
    private extractData(res: HttpResponse<object>) {
        let body = res;
        return body || {};
    }
}