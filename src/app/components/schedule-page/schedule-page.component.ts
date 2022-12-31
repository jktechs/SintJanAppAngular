import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Lesson, setVar, Week, getWeek } from 'src/lib/Utils';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent implements OnInit, OnDestroy {
  startMinute = 8*60+30;
  endMinute = 5 + 18*60+5;
  weekNumber = getWeek(new Date());
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
      if(subj !== undefined)
        subj.weeks.forEach(week=>{
          if(week.index <= this.weekNumber+1 && week.index >= this.weekNumber-1){
            let page = week.index - this.weekNumber + 1;
            for(let j = 0;j<this.total;j++)
              out[page].days[j] = out[page].days[j].concat(week.days[j]);
          }
        })
    });
    return out;
  }
  days: {index: number, text: string}[] = [{index:0,text:"Mon"},{index:1,text:"Tue"},{index:2,text:"Wen"},{index:3,text:"Thu"},{index:4,text:"Fri"},{index:5,text:"Sat"},{index:6,text:"Sun"}];
  constructor() {
    this.width = window.innerWidth/2;
    this.minuteToPixel = window.innerHeight*0.75*0.93/(this.endMinute-this.startMinute);
    this.page = new PageHandler(this.width);
    this.page.update = (n: number) => {this.weekNumber += n}
  }
  ngOnInit(): void {
    setVar(this,"sc")
    setVar(AppComponent.data.value,"data")
  }
  ngOnDestroy(): void {
    this.page.clear();
  }
  showOptions(l: Lesson){
    if(l.options.length !== 0 && NavigationComponent.instance.kwtPage !== undefined)
      NavigationComponent.instance.setActive(NavigationComponent.instance.kwtPage, l);
  }
}
export class PageHandler {
  static epsilon = 0.01;
  width: number;
  constructor(width: number) {
    this.width = width;
  }
  update: ((n: number)=>void) | undefined;
  offset: number = 0;
  intervals: (ReturnType<typeof setInterval>)[] = []
  lastId: number = -1;
  oldPos: number = 0;
  pressed: boolean = false;
  log(e: PointerEvent): void {
    if(e.pointerId !== this.lastId){
      if(this.clear()){
        let page = Math.round(this.offset/this.width);
        let diff: number = this.offset/this.width - page;
        if(this.update !== undefined && page !== 0) {
          this.update(Math.sign(diff));
          //alert("via log")
        }
      }
      this.offset = 0;
      this.oldPos = e.x
      this.pressed = true
      this.lastId = e.pointerId
    }
    if(this.pressed) {
      let delta: number = (e.x-this.oldPos)*1.75;
      this.offset += delta
      this.oldPos = e.x
    }
    this.clamp();
  }
  clamp(): void {
    this.offset = Math.max(2*PageHandler.epsilon-this.width,Math.min(this.width-2*PageHandler.epsilon,this.offset));
  }
  reset(e: PointerEvent): void {
    this.pressed = false;
    this.intervals.push(setInterval(()=>{
      let page = Math.round(this.offset/this.width);
      let diff: number = this.offset/this.width - page;
      //alert(diff)
      if(Math.abs(diff) < PageHandler.epsilon){
        if(this.update !== undefined && page !== 0) {
          this.update(Math.sign(diff));
          //alert("via reset")
        }
        this.offset = 0;
        this.clear();
      }
      if(!this.pressed)
        this.offset -= 9.2*0.008*diff*this.width;
        this.clamp();
    },8));
  }
  clear(): boolean {
    if(this.intervals.length === 0)
      return false;
    let handle: ReturnType<typeof setInterval> | undefined;
    while((handle = this.intervals.pop()) !== undefined) {
      clearInterval(handle);
    }
    return true;
  }
}