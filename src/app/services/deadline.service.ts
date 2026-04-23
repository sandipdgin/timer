import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeadlineResponse } from '../model/deadline-response';
import { Observable, of, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeadlineService {
  private readonly apiUrl = '/api/deadline';

  constructor(private http: HttpClient) {}

  getDeadline(): Observable<DeadlineResponse> {
    // return of({      secondsLeft: 120,    });
    return this.http.get<DeadlineResponse>(this.apiUrl).pipe(shareReplay(1));
  }
}
