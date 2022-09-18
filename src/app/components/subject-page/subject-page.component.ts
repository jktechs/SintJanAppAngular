import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Grade, Subject } from 'src/lib/Utils';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-subject-page',
  templateUrl: './subject-page.component.html',
  styleUrls: ['./subject-page.component.css']
})
export class SubjectPageComponent implements OnInit {

  public subjectName: string = "";
  public grades: Grade[] = [];
  constructor() {
    if(NavigationComponent.instance.activeElement !== undefined)
      this.subjectName = NavigationComponent.instance.activeElement.data.name
    if(Object.keys(AppComponent.data.value.subjects).includes(this.subjectName)) {
      	let s: Subject | undefined = AppComponent.data.value.subjects[this.subjectName];
        if(s !== undefined)
          this.grades = s.grades;
    }
  }
  ngOnInit(): void {
    //console.log();
  }
  back(): void {
    alert("back")
  }

}