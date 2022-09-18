import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Subject } from 'src/lib/Utils';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-subject-list-page',
  templateUrl: './subject-list-page.component.html',
  styleUrls: ['./subject-list-page.component.css']
})
export class SubjectListPageComponent implements OnInit {
  public get subjects(): Subject[] {
    let list: Subject[] = [];
    for(let item in AppComponent.data.value.subjects){
      let subj = AppComponent.data.value.subjects[item];
      if(subj !== undefined)
        list.push(subj)
    }
    return list.filter(x=>x.name !== "idk" && x.name !== "kwt").sort((a,b)=>{
      return a.name.localeCompare(b.name);
    });
  }
  ngOnInit(): void {
  }
  log(subj: Subject): void {
    if(NavigationComponent.instance.subjectPage !== undefined)
      NavigationComponent.instance.setActive(NavigationComponent.instance.subjectPage,subj)
  }
  getAverage(s: Subject) : number {
    if(s.average !== undefined){
      return s.average.value
    } else return 0;
  }
}