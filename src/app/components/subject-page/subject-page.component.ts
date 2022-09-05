import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Grade, Subject } from 'src/lib/Utils';

@Component({
  selector: 'app-subject-page',
  templateUrl: './subject-page.component.html',
  styleUrls: ['./subject-page.component.css']
})
export class SubjectPageComponent implements OnInit {
  subjs: {grade: Grade[], subjname: string}[] = Object.values(AppComponent.data.value.subjects).filter((item: Subject | undefined): item is Subject => {return !!item}).map(x => {return {grade: x.grades, subjname: x.name}});
  text: string = JSON.stringify(this.subjs);
  constructor() { }
  ngOnInit(): void {
    console.log();
  }

}