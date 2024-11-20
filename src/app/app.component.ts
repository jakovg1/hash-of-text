import { Component, OnDestroy, OnInit } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs';
import { HashService } from './hash-service/hash-service.service';
import {
  HashAlgorithmResponse,
  HashOfStringResponse,
  SupportedAlgorithmsResponse,
} from './hash-service/hash-service.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'hash-of-text';

  public listOfHashes: HashOfStringResponse[] = [];
  public textInput: string = '';
  public textInputElement: Element | null = null;
  private flushInputText$: Subject<string> = new Subject();

  private destroy$: Subject<void> = new Subject();

  public algorithmsForm: FormGroup = new FormGroup([]);
  public hashAlgorithmOptions: string[] = [];

  public currentHashAlg$: Observable<string>;
  public algorithmChanged$: Subject<string> = new Subject();

  constructor(private hashService: HashService, private fb: FormBuilder) {
    this.currentHashAlg$ = this.algorithmChanged$.pipe(
      switchMap((_) => this.hashService.getHashAlgorithm()),
      map((response: HashAlgorithmResponse) => response.algorithm)
    );
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public enterKeyPressed(event: any) {
    this.flushInputText$.next(event.target.value);
  }

  ngOnInit() {
    this.algorithmsForm = this.fb.group({
      selectedAlgorithm: new FormControl(),
    });

    this.textInputElement = document.querySelector('input.textbox');

    //populate has algorithm options
    this.hashService
      .getSupportedHashAlgorithms()
      .pipe(
        map(
          (response: SupportedAlgorithmsResponse) =>
            response.supportedAlgorithms
        ),
        tap(
          (supportedAlgorithms: string[]) =>
            (this.hashAlgorithmOptions = supportedAlgorithms)
        ),
        switchMap((supportedAlgorithms: string[]) => {
          this.algorithmChanged$.next(supportedAlgorithms[0] || '');
          return of();
        }),
        takeUntil(this.destroy$),
        catchError((err) => {
          alert(err);
          return of();
        })
      )
      .subscribe();

    //subscribe to algorithm changes
    this.algorithmChanged$
      .pipe(
        switchMap((algorithm: string) =>
          this.hashService.setHashAlgorithm(algorithm)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((foo) => console.log(foo));

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
        takeUntil(this.destroy$),
        catchError((_) => of({} as HashOfStringResponse))
      )
      .subscribe((hashResponse: HashOfStringResponse) => {
        if (hashResponse === undefined) return;
        this.processCurrentTextValue(hashResponse);
      });

    const deleteInterval = 4_000;
    interval(deleteInterval).subscribe(() => this.listOfHashes.shift());
  }

  public onAlgorithmChange(): void {
    const selectedAlgorithm =
      this.algorithmsForm.get('selectedAlgorithm')?.value;
    this.algorithmChanged$.next(selectedAlgorithm);
  }

  public processCurrentTextValue(hashResponse: HashOfStringResponse): void {
    this.listOfHashes.push(hashResponse);
    (this.textInputElement as HTMLInputElement).value = '';
  }
}
