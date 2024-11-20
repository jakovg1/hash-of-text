import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HashAlgorithmRequest,
  HashAlgorithmResponse,
  HashOfStringRequest,
  HashOfStringResponse,
  SupportedAlgorithmsResponse,
} from './hash-service.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HashService {
  //this should not stay in this file.
  private hashApiUrl: string = 'https://localhost:8443';

  //endpoints
  private getHashOfStringEndpoint: string = '/hash-string/hash';
  private getHashAlgorithmEndpoint: string = '/hash-string/algorithm';
  private setHashAlgorithmEndpoint: string = '/hash-string/algorithm';
  private getSupportedAlgorithmsEndpoint: string = '/hash-string/algorithms';

  constructor(private http: HttpClient) {
    //
  }

  public getHashOfString(
    stringToBeHashed: string
  ): Observable<HashOfStringResponse> {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<HashOfStringResponse>(
      this.hashApiUrl + this.getHashOfStringEndpoint,
      { input: stringToBeHashed } as HashOfStringRequest,
      { headers: httpHeaders }
    );
  }

  public getHashAlgorithm(): Observable<HashAlgorithmResponse> {
    return this.http.get<HashAlgorithmResponse>(
      this.hashApiUrl + this.getHashAlgorithmEndpoint
    );
  }

  public setHashAlgorithm(algorithm: string): Observable<any> {
    return this.http.post<HashAlgorithmRequest>(
      this.hashApiUrl + this.setHashAlgorithmEndpoint,
      { algorithm } as HashAlgorithmRequest
    );
  }

  public getSupportedHashAlgorithms(): Observable<SupportedAlgorithmsResponse> {
    return this.http.get<SupportedAlgorithmsResponse>(
      this.hashApiUrl + this.getSupportedAlgorithmsEndpoint
    );
  }
}
