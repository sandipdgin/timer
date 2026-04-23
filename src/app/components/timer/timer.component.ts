import { Component } from '@angular/core';
import { DeadlineService } from '../../services/deadline.service';
import { map, Observable, switchMap, takeWhile, timer } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent {
  secondsLeft$: Observable<number>;

  constructor(private deadlineService: DeadlineService) {
    this.secondsLeft$ = this.deadlineService.getDeadline().pipe(
      switchMap((response) => {
        const serverTime = Date.now();
        const deadline = serverTime + response.secondsLeft * 1000;

        return timer(0, 1000).pipe(
          map(() => Math.max(0, Math.floor((deadline - Date.now()) / 1000))),
          takeWhile((v) => v >= 0, true),
        );
      }),
    );
  }
}
