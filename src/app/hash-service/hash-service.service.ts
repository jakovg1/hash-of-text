import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HashResponse } from './hash-service.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HashService {
  private hashApiUrl: string = 'https://localhost:8443';
  private hashOfStringEndpoint: string = '/hash';

  constructor(private http: HttpClient) {
    //
  }

  public getHash(stringToBeHashed: string): Observable<HashResponse> {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<HashResponse>(
      this.hashApiUrl + this.hashOfStringEndpoint,
      JSON.stringify(stringToBeHashed),
      { headers: httpHeaders }
    );
  }
}
