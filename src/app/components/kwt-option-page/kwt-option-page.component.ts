import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Lesson } from 'src/lib/Utils';
import { Action } from 'src/lib/Zermelo';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-kwt-option-page',
  templateUrl: './kwt-option-page.component.html',
  styleUrls: ['./kwt-option-page.component.css']
})
export class KwtOptionPageComponent implements OnInit {
  options: Action[] = [];
  lesson: undefined | Lesson;
  constructor() {
    if(NavigationComponent.instance.activeElement !== undefined)
      this.options = (NavigationComponent.instance.activeElement.data as Lesson).options;
  }

  ngOnInit(): void {
  }
  execute(a: Action){
    AppComponent.zermelo.post(a.post);
  }

}
