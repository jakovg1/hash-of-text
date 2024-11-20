import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  catchError,
  debounceTime,
  filter,
  fromEvent,
  interval,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  throttleTime,
} from 'rxjs';
import { HashService } from './hash-service/hash-service.service';
import {
  HashAlgorithmResponse,
  HashOfStringResponse,
} from './hash-service/hash-service.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'hash-of-text';

  public listOfHashes: HashOfStringResponse[] = [];
  public textInput: string = '';
  public textInputElement: Element | null = null;
  private flushInputText$: Subject<string> = new Subject();

  public currentHashAlg$: Observable<string>;

  constructor(private hashService: HashService) {
    this.currentHashAlg$ = this.hashService
      .getHashAlgorithm()
      .pipe(map((response: HashAlgorithmResponse) => response.algorithm));
  }

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
        switchMap((inputString) =>
          this.hashService.getHashOfString(inputString)
        ),
        catchError((err) => of({} as HashOfStringResponse))
      )
      .subscribe((hashResponse: HashOfStringResponse) => {
        if (hashResponse === undefined) return;
        this.processCurrentTextValue(hashResponse);
      });

    const deleteInterval = 4_000;
    interval(deleteInterval).subscribe(() => this.listOfHashes.shift());
  }

  public processCurrentTextValue(hashResponse: HashOfStringResponse): void {
    this.listOfHashes.push(hashResponse);
    (this.textInputElement as HTMLInputElement).value = '';
  }
}
