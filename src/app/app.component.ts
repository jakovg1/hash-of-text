import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  debounceTime,
  fromEvent,
  interval,
  map,
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

  public listOfHashes: string[] = [];
  public textInput: string = '';
  public textInputElement: Element | null = null;

  constructor(private hashService: HashService) {}

  public enterKeyPressed(event: any) {
    this.processCurrentTextValue(event.target.value);
  }

  ngOnInit() {
    //this is because of SSR (Server side Rendering)
    if (document !== undefined) {
      let a = 5;
      this.textInputElement = document!.querySelector('input.textbox');
    }

    const textObservable$ = fromEvent(this.textInputElement!, 'keyup').pipe(
      map((event: any) => event.target.value)
    );

    textObservable$
      .pipe(
        debounceTime(500),
        throttleTime(300),
        switchMap((inputString) => this.hashService.getHash(inputString))
      )
      .subscribe((hashResponse: HashResponse) =>
        this.processCurrentTextValue(
          hashResponse.input + ': ' + hashResponse.hashOfInput
        )
      );

    const deleteInterval = 5_000;
    interval(deleteInterval).subscribe(() => this.listOfHashes.shift());

    // textObservable$
    //   .pipe(debounceTime(300), throttleTime(3000))
    //   .subscribe(() => {});
  }

  public processCurrentTextValue(newTextValue: string): void {
    this.listOfHashes.push(newTextValue);
    (this.textInputElement as HTMLInputElement).value = '';
  }
}
