import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Products } from '../models/products';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private readonly API_URL = 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/'

    dataChange: BehaviorSubject<Products[]> = new BehaviorSubject<Products[]>([]);
    // Temporarily stores data from dialogs
    dialogData: any;

    constructor (private httpClient: HttpClient) {}

    get data(): Products[] {
        return this.dataChange.value;
    }
    getDialogData() {
        return this.dialogData;
    }

    getAllProducts(): void {
        this.httpClient.get<Products[]>(this.API_URL + 'data/productList').subscribe(data => {
            this.dataChange.next(data);
          },
          (error: HttpErrorResponse) => {
          console.log (error.name + ' ' + error.message);
          });
    }

    addProducts (products: Products): void {
        this.dialogData = products;
    }
    
    updateProducts (products: Products): void {
        this.dialogData = products;
    }

    deleteProducts (id: string): void {
        console.log(id);
    }
    
}