import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,  HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Detail } from '../models/detail';
import { BehaviorSubject } from 'rxjs';



@Injectable({
    providedIn: 'root'
})
export class ProddetailService {

    private readonly API_URL = 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/';


  dataChange: BehaviorSubject<Detail[]> = new BehaviorSubject<Detail[]>([]);

  constructor (
    private http: HttpClient,
    private httpClient: HttpClient) {}

  get data(): Detail[] {
    return this.dataChange.value
  }

  getAllDetails(): void {
    this.httpClient.get<Detail[]>(this.API_URL + 'data/alert/list/:id').subscribe(data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
      console.log (error.name + ' ' + error.message);
      });
  }


  getDetails(indexNumber: number, pageSize: number, startDate: string, endDate: string): Observable<any> {
    return this.http.get(this.API_URL + 'data/alert/list/:id',
    {
      params: {
        indexNumber,
        pageSize,
        startDate,
        endDate
      },
    });
  }

}