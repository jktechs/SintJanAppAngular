import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Somtoday } from 'src/lib/Somtoday';
import { setVar, Week } from 'src/lib/Utils';

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent implements OnInit, OnDestroy {
  startMinute = 20 + 9*60;
  endMinute = 5 + 16*60;
  weekNumber = 37;
  minuteToPixel: number = -1;

  width: number;
  page: PageHandler;
  total: number = 5;
  fakeArray = new Array(this.total);
  get weeks(): Week[] {
    let out: Week[] = [new Week(0), new Week(1), new Week(2)];
    let keys = Object.keys(AppComponent.data.value.subjects);
    keys.forEach(key => {
      let subj = AppComponent.data.value.subjects[key];
      if(subj !== undefined){
        for(let i = 0;i<subj.weeks.length;i++) {
          if(subj.weeks[i].index <= this.weekNumber+1 && subj.weeks[i].index >= this.weekNumber-1){
            let page = subj.weeks[i].index - this.weekNumber + 1;
            for(let j = 0;j<this.total;j++){
              out[page].days[j] = out[page].days[j].concat(subj.weeks[i].days[j]);
            }
          }
        }
      }
    });
    return out;
  }
  days: {index: number, text: string}[] = [{index:0,text:"Mon"},{index:1,text:"Tue"},{index:2,text:"Wen"},{index:3,text:"Thu"},{index:4,text:"Fri"},{index:5,text:"Sat"},{index:6,text:"Sun"}];
  constructor() {
    this.width = window.innerWidth/2;
    this.minuteToPixel = window.innerHeight/2*0.75*0.93/(this.endMinute-this.startMinute);
    this.page = new PageHandler(this.width);
  }
  ngOnInit(): void {
    setVar(this,"sc")
    setVar(AppComponent.data.value,"data")
  }
  ngOnDestroy(): void {
    if(this.page.interval !== undefined)
      clearInterval(this.page.interval);
  }
}
export class PageHandler {
  static epsilon = 0.01;
  width: number;
  constructor(width: number) {
    this.width = width;
  }
  offset: number = 0;
  interval: ReturnType<typeof setInterval> | undefined;
  lastId: number = -1;
  oldPos: number = 0;
  pressed: boolean = false;
  log(e: PointerEvent): void {
    this.offset = Math.max(-this.width,Math.min(this.width,this.offset))
    if(e.pointerId !== this.lastId){
      this.oldPos = e.x
      this.pressed = true
      this.lastId = e.pointerId
    }
    if(this.pressed) {
      let delta: number = (e.x-this.oldPos)*2;
      this.offset += delta
      this.oldPos = e.x
    }
  }
  reset(e: PointerEvent): void {
    this.pressed = false;
    this.interval = setInterval(()=>{
      let diff: number = this.offset/this.width - Math.round(this.offset/this.width);
      if(Math.abs(diff) < PageHandler.epsilon){
        //update
        this.offset = this.width*diff;
        clearInterval(this.interval);
        this.interval = undefined;
      }
      if(!this.pressed)
        this.offset -= 0.1*diff*this.width;
    },20);
  }
}