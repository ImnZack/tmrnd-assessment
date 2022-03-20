import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ProddetailService } from '../services/proddetail.service'; 
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Detail } from '../models/detail';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, Router } from '@angular/router'
import { TokenStorageService } from '../services/token-storage.service';
import { formatDate } from '@angular/common';
import * as moment from 'moment';


@Component({
  selector: 'app-proddetail',
  templateUrl: './proddetail.component.html',
  styleUrls: ['./proddetail.component.scss']
})
export class ProddetailComponent implements OnInit {

  displayedColumns = ['status', 'dateTimeString', 'remark', 'duration'];
  dataSource: MatTableDataSource<Detail> = new MatTableDataSource();
  id = 0
  detail
  indexNumber: number;
  pageSize: number;
  startDate: string; 
  endDate: string;
  routeSub
  todayDate;
  yesterdayDate;
  dateRangeForm: FormGroup;
  form;
  totalRows
  pageIndex
  totalNumberOfRecords = 0;
  isLoading = false;
  currentPage = 1;

  constructor(public httpClient: HttpClient,
              private proddetailService: ProddetailService,
              private route: ActivatedRoute,
              private tokenService: TokenStorageService, 
              private formBuilder: FormBuilder,
              private router: Router) {}

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('filter',  {static: true}) filter: ElementRef;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
    })

    let date = new Date();
    this.todayDate = formatDate(new Date(), "dd/MM/yyyy", 'en-gb')
    this.yesterdayDate = formatDate(date.setDate(date.getDate() - 1), "dd/MM/yyyy", 'en-gb');

    this.form = this.formBuilder.group({
      rangeDate: this.formBuilder.group({
        startDate: new FormControl(date),
        endDate: new FormControl(new Date()),
      })
    });
  }

  calculateDiff(duration){
   
    let todayDate = new Date();
    let startDate = new Date();
    let durationDate = new Date(duration);
    startDate.setDate(startDate.getDate());
    let differenceInTime = todayDate.getTime() - startDate.getTime();
    let differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24)); 
    return differenceInDays;
}
  
  getDetails(id, indexNumber, pageSize, startDate, endDate) {
    this.getTotalProductDetails(id, startDate, endDate);
    this.isLoading = true;
    this.proddetailService.getDetails( indexNumber, pageSize, startDate, endDate).subscribe({
      next: data => {
        this.detail = data.data;
        this.dataSource.data = this.detail
        this.isLoading = false;
      },
    })
  }
  getTotalProductDetails(id, startDate, endDate) {
    this.isLoading = true;
    this.proddetailService.getDetails( 0, 250, startDate, endDate).subscribe({
      next: data => {
        this.totalRows = data.data.length
        this.isLoading = false;
      },
    })
  }
  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    if (dateRangeStart.value != '' && dateRangeEnd.value != '') {
      //Convert date from DD/MM/YYY to YYYY-MM-DD for api call
      let start = moment(dateRangeStart.value, "DD/MM/YYYY");
      let end = moment(dateRangeEnd.value, "DD/MM/YYYY");
      this.startDate = start.format("YYYY-MM-DD")
      this.endDate = end.format("YYYY-MM-DD")
      this.currentPage = 1;
      this.getDetails(this.id, this.pageIndex, this.pageSize, this.startDate, this.endDate);
    }
  }
}

  export class ExampleDataSource extends DataSource<Detail> {
    _filterChange = new BehaviorSubject('');
    get filter(): string {
      return this._filterChange.value;
    }
    set filter(filter: string) {
      this._filterChange.next(filter);
    }
    filteredData: Detail[] = [];
    renderedData: Detail[] = [];
    constructor(public _exampleDatabase: ProddetailService,
                public _paginator: MatPaginator,
                public _sort: MatSort) {
      super();
      this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
    }
  
    connect(): Observable<Detail[]> {
      const displayDataChanges = [
        this._exampleDatabase.dataChange,
        this._sort.sortChange,
        this._filterChange,
        this._paginator.page
      ];
      this._exampleDatabase.getAllDetails();
  
      return merge(...displayDataChanges).pipe(map( () => {
          this.filteredData = this._exampleDatabase.data.slice().filter((details: Detail) => {
            const searchStr = (details.id + details.startDate + details.remark + details.duration ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
  
          const sortedData = this.sortData(this.filteredData.slice());
  
          const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
          this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
          return this.renderedData;
        }
      ));
    }
  
    disconnect() {}
  
    sortData(data: Detail[]): Detail[] {
      if (!this._sort.active || this._sort.direction === '') {
        return data;
      }
  
      return data.sort((a, b) => {
        let propertyA: number | string = '';
        let propertyB: number | string = '';
  
        switch (this._sort.active) {
          case 'status': [propertyA, propertyB] = [a.status, b.status]; break;
          case 'startDate': [propertyA, propertyB] = [a.startDate, b.startDate]; break;
          case 'remark': [propertyA, propertyB] = [a.remark, b.remark]; break;
          case 'duration': [propertyA, propertyB] = [a.duration, b.duration]; break;
        }
  
        const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
        const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
  
        return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
      });
    }

}