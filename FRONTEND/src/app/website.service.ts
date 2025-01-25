import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

import { Website } from './website';
import { MessageService } from './message.service';
import { Page } from './page';


@Injectable({
  providedIn: 'root'
})
export class WebsiteService {

  private readonly websitesUrl = 'http://localhost:3032/api/websites';
  private readonly websiteUrl = 'http://localhost:3032/api/website';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private readonly http: HttpClient,
    private readonly messageService: MessageService
  ) { }

  getWebsites(): Observable<Website[]> {
    return this.http.get<Website[]>(this.websitesUrl)
      .pipe(
        tap(_ => this.log('fetched websites')),
        catchError(this.handleError<Website[]>('getWebsites', []))
      );
  }

  addWebsite(website: Website): Observable<Website> {
    return this.http.post<Website>(this.websitesUrl, website, this.httpOptions).pipe(
      tap((newWebsite: Website) => this.log(`added website w/ id=${newWebsite._id}`)),
      catchError(this.handleError<Website>('addWebsite'))
    );
  }

  getWebsite(websiteId: string | null): Observable<Website> {
    const url = `${this.websiteUrl}/${websiteId}`;
    return this.http.get<Website>(url).pipe(
      tap(_ => this.log(`fetched website id=${websiteId}`)),
      catchError(this.handleError<Website>(`getWebsite id=${websiteId}`))
    );
  }

  updateWebsiteStatus(websiteId: string | null): Observable<any> { //Não serve para nada esta função
    const url = `${this.websiteUrl}/${websiteId}`;
    return this.http.patch(url, { websiteId }, this.httpOptions).pipe(
      tap(_ => this.log(`updated website id=${websiteId}`)),
      catchError(this.handleError<any>('updateWebsiteStatus'))
    );
  }
  
  deleteWebsite(websiteId: string | null): Observable<Website> {
    const url = `${this.websiteUrl}/${websiteId}`;
    return this.http.delete<Website>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted website id=${websiteId}`)),
      catchError(this.handleError<Website>('deleteWebsite'))
    );
  }

  getWebsitePages(websiteId: string | null): Observable<Page[]> {
    const url = `${this.websiteUrl}/${websiteId}/pages`;
    return this.http.get<Page[]>(url).pipe(
      tap(_ => this.log(`fetched pages of website id=${websiteId}`)),
      catchError(this.handleError<Page[]>(`getWebsitePages id=${websiteId}`))
    );
  }

  addWebsitePage(websiteId: string | null, page: Page): Observable<Page> {
    const url = `${this.websiteUrl}/${websiteId}/pages`;
    return this.http.post<Page>(url, page, this.httpOptions).pipe(
      tap((newPage: Page) => this.log(`added page w/ id=${newPage._id}`)),
      catchError(this.handleError<Page>('addWebsitePage'))
    );
  }

  getWebsitePage(websiteId: string | null, pageId: string | null): Observable<Page> {
    const url = `${this.websiteUrl}/${websiteId}/page/${pageId}`;
    return this.http.get<Page>(url).pipe(
      tap(_ => this.log(`fetched page id=${pageId}`)),
      catchError(this.handleError<Page>(`getWebsitePage id=${pageId}`))
    );
  }

  updatePageStatus(websiteId: string, pageId: string, status: string): Observable<any> {
    const url = `${this.websiteUrl}/${websiteId}/page/${pageId}`;
    return this.http.patch(url, { validationStatus: status }, this.httpOptions).pipe(
      tap(_ => this.log(`updated page id=${pageId} status=${status}`)),
      catchError(this.handleError<any>('updatePageStatus'))
    );
  }  

  deleteWebsitePage(websiteId: string | null, pageId: string | null): Observable<Page> {
    const url = `${this.websiteUrl}/${websiteId}/page/${pageId}`;
    return this.http.delete<Page>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted page id=${pageId}`)),
      catchError(this.handleError<Page>('deleteWebsitePage'))
    );
  }

  evaluateWebsite(websiteId: string | null, pages: Page[]): Observable<any> {
    const url = `${this.websiteUrl}/${websiteId}/evaluate`;

    // Construct the body of the request
    // The body contains a list of pageIds
    const body = { pageIds: pages.map(p => p._id) };

    // Send the POST request
    return this.http.post(url, body, this.httpOptions).pipe(
      tap(_ => this.log(`evaluated website id=${websiteId}`)),
      catchError(this.handleError<any>('evaluateWebsite'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (res: any): Observable<T> => {
      alert(res.error)
      console.error(res);
      this.log(`${operation} failed: ${res.statusText}: ${res.error}`);
      return of(result as T);
    };
  }

  private log(message: string) {
    this.messageService.add(`WebsiteService: ${message}`);
  }
}
