import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  debounceTime,
  filter,
  fromEvent,
  interval,
  map,
  merge,
  Subject,
  switchMap,
  throttleTime,
} from 'rxjs';
import { HashService } from './hash-service/hash-service.service';
import { HashResponse } from './hash-service/hash-service.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'hash-of-text';

  public listOfHashes: HashResponse[] = [];
  public textInput: string = '';
  public textInputElement: Element | null = null;
  private flushInputText$: Subject<string> = new Subject();

  constructor(private hashService: HashService) {}

  public enterKeyPressed(event: any) {
    this.flushInputText$.next(event.target.value);
  }

  ngOnInit() {
    this.textInputElement = document.querySelector('input.textbox');

    const textObservable$ = fromEvent(this.textInputElement!, 'keyup').pipe(
      map((event: any) => event.target.value),
      debounceTime(500),
      throttleTime(300)
    );

    const flushedTextObservable = merge(textObservable$, this.flushInputText$);

    flushedTextObservable
      .pipe(
        filter((inputString) => inputString.trim() !== ''),
        switchMap((inputString) => this.hashService.getHash(inputString))
      )
      .subscribe((hashResponse: HashResponse) => {
        this.processCurrentTextValue(hashResponse);
      });

    const deleteInterval = 4_000;
    interval(deleteInterval).subscribe(() => this.listOfHashes.shift());
  }

  public processCurrentTextValue(hashResponse: HashResponse): void {
    this.listOfHashes.push(hashResponse);
    (this.textInputElement as HTMLInputElement).value = '';
  }
}
