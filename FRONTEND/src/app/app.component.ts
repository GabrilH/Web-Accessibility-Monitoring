import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private readonly http: HttpClient, public router: Router) {}

  initData(): void {
    console.log('Initializing database');
    const url = 'http://localhost:3032/api/init';
    this.http.get(url).subscribe(() => {
      console.log('Database initialized');
      window.location.href = '/websites';
    });
  }

}
