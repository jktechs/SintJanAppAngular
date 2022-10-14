import { Component, OnInit } from '@angular/core';
import { afsprakenResult, resultatenResult, Somtoday, Vak } from 'src/lib/Somtoday';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { LivescheduleResponse, Zermelo } from 'src/lib/Zermelo';
import { Browser } from '@capacitor/browser';
import { JSONObject, Savable, Subject, Location, Lesson, Week, setVar, getWeekDates } from 'src/lib/Utils';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { AppLauncher } from '@capacitor/app-launcher';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public static instance: AppComponent;
  public visible: boolean = true;
  stopScan(): void{
    BarcodeScanner.stopScan({resolveScan: true});
    this.visible = true;
  }
  constructor(private browser: InAppBrowser) {
    AppComponent.instance = this;
  }
  /* 
  "Link Grid"
  "Grades"
  "Scedule"
  "Settings"
  ----------
  "Grade"
  "KWT"
  */
  linkGrid: string = "Link Grid";
  grades: string = "Grades";
  scedule: string = "Scedule";
  settings: string = "Settings";
  grade: string = "Grade";
  KWT: string = "KWT";
  ngOnInit(): void {
    this.loadData();
  }
  public static numberOfDays = 7;
  public static maxDelay: number = 3600*1000;
  public static somtoday: Somtoday;
  public static zermelo: Zermelo;
  public static settings: JSONObject<boolean[]> = new JSONObject<boolean[]>([false, false, false]);
  public static data: JSONObject<{timestamp: number, subjects: {[name: string]: Subject | undefined}}> = new JSONObject<{timestamp: number, subjects: {[name: string]: Subject | undefined}}>({timestamp: -1,subjects:{}});
  async loadData() {
    //Preferences.clear();
    App.addListener('appUrlOpen', (data)=>{
      Browser.close();
      let url = new URL(data.url)
      let code = url.searchParams.get('code')
      if(code !== null)
        AppComponent.somtoday.getCodeToken(code).then((t)=>{
          alert("login succses")
        })
    })
    AppComponent.somtoday = new Somtoday(()=>{
      Savable.Save("somtoday",AppComponent.somtoday);
    });
    AppComponent.zermelo = new Zermelo(()=>{
      Savable.Save("zermelo",AppComponent.zermelo);
    })
    await Savable.Load("somtoday", AppComponent.somtoday);
    await Savable.Load("zermelo", AppComponent.zermelo);
    await Savable.Load("settings", AppComponent.settings);
    
    await Preferences.remove({key: "data"});
    let obj = new JSONObject<{timestamp: number, subjects: {[key: string]: Subject}}>({timestamp:-1,subjects:{}});
    AppComponent.data = await Savable.Load("data",obj);
    //if(AppComponent.data.value.timestamp > AppComponent.maxDelay) {
    //  console.log("updating somtoday data");
    //  let week: number = 22;
    //  let year: number = 2022;
    //  let {begin, end} = getWeekDates(year, week, 3);
    //  AppComponent.somtoday.getScedule(begin, end).then(schedule => {
        //alert(JSON.stringify(schedule));
    //  });
    //}
    let dates = getWeekDates(2022, AppComponent.getWeek(new Date())-1,3);
    
    let result: afsprakenResult = await AppComponent.somtoday.getScedule(dates.begin, dates.end);
    result.items.forEach(item=>{
      let start = new Date(item.beginDatumTijd);
      let end = new Date(item.eindDatumTijd);
      let subject = item.additionalObjects.vak;
      let name = "idk";
      if(subject !== null)
        name = subject.afkorting;
      this.addLesson(name, item.titel, new Location(item.locatie.toUpperCase()), start, end);
    })
    let result2: resultatenResult = await AppComponent.somtoday.getGrades();
    result2.items.forEach(item=>{
      let name = item.vak.afkorting;
      if(!Object.keys(AppComponent.data.value.subjects).includes(name)){
        let s = new Subject();
        s.name = name;
        AppComponent.data.value.subjects[name] = s;
      }
      if(item.type === 'Toetskolom' && item.geldendResultaat !== undefined && item.weging !== undefined) {
        AppComponent.data.value.subjects[name]?.grades.push({value: item.geldendResultaat, weight: item.weging, discriptor: item.omschrijving === undefined?"":item.omschrijving})
      } else if(item.type === 'SEGemiddeldeKolom' && item.geldendResultaat !== undefined && AppComponent.data.value.subjects[name] !== undefined) {
        let s = AppComponent.data.value.subjects[name];
        if(s !== undefined)
        s.average = {value: item.geldendResultaat, weight: 0, discriptor: item.omschrijving === undefined?"":item.omschrijving}
      }
    })
    //let result3: LivescheduleResponse = await AppComponent.zermelo.getScedule(2022,1+AppComponent.getWeek(new Date()));
    //result3.response.data[0].appointments.forEach(app =>{
    //  let id = app.id;
    //  let begin: Date = new Date(app.start*1000);
    //  let end: Date = new Date(app.end*1000);
    //  if(app.subjects[0] === undefined){
    //    this.addLesson("kwt", "kwt", new Location(app.locations[0]), begin, end).options = app.actions;
    //  } else {
    //    this.addLesson(app.subjects[0], app.subjects[0], new Location(app.locations[0]), begin, end);
    //  }
    //});
  }
  public static getWeek(currentdate: Date): number {
    var oneJan = new Date(currentdate.getFullYear(),0,1);
    oneJan.setDate(oneJan.getDate()-oneJan.getDay()+1);
    if(oneJan.getFullYear() !== currentdate.getFullYear())
      oneJan.setDate(oneJan.getDate()+7);
    return Math.floor((currentdate.getTime() - oneJan.getTime()) / (24 * 3600 * 1000 * 7))+1;
  }
  addLesson(name: string, title: string, location: Location, begin: Date, end: Date) : Lesson{
    let week = AppComponent.getWeek(begin);
    let day = (begin.getDay()-1) - Math.floor((begin.getDay()-1)/7)*7;
    let beginMinutes = begin.getMinutes()+begin.getHours()*60;
    let endMinutes = end.getMinutes()+end.getHours()*60;
    if(!Object.keys(AppComponent.data.value.subjects).includes(name)){
      let s = new Subject();
      s.name = name;
      AppComponent.data.value.subjects[name] = s;
    }
    let s = AppComponent.data.value.subjects[name];
    let lesson = new Lesson(title, location, day, week, beginMinutes, endMinutes)
    if(!(s instanceof Subject)) return lesson;
    let weekIndex = s.weeks.findIndex(x=>{return x.index == week;})
    if(weekIndex === -1) {
      let w: Week = new Week(week);
      w.days = [[],[],[],[],[],[],[]];
      s.weeks.push(w);
      weekIndex += s.weeks.length
    }
    let dayIndex: number = s.weeks[weekIndex].days[day].findIndex(x => x.dayNumber === day && x.start === beginMinutes && x.end === endMinutes)
    if(dayIndex === -1)
      s.weeks[weekIndex].days[day].push(lesson);
    else
      return lesson;
    return lesson;
  }
  public static linkSettings: {[name: string]: {androidLink?: string, iosLink?: string, webLink: string, settingsIndex: number}} = {
    "zermelo": {webLink: Zermelo.loginLink, settingsIndex: -1},
    "office": {webLink: "https://www.office.com/", settingsIndex: -1},
    "sintjan": {webLink: "https://www.sintjan-lvo.nl/", settingsIndex: -1},
    "somtoday": {webLink: "https://inloggen.somtoday.nl/", androidLink: "nl.topicus.somtoday.leerling", settingsIndex: 0},
    "itsLearning": {webLink: "https://lvo.itslearning.com/", androidLink: "com.itslearning.itslearningintapp", iosLink: "", settingsIndex: 1}
  }
  link(name: string): void {
    AppComponent.openLink(name);
  }
  public static async openLink(name: string): Promise<void> {
    if(!Object.keys(AppComponent.linkSettings).includes(name)) return;
    let data = AppComponent.linkSettings[name];
    if(data.settingsIndex != -1 && data.androidLink !== undefined && AppComponent.settings.value[data.settingsIndex]){
      let { value } = await AppLauncher.canOpenUrl({ url: data.androidLink });
      if(value){
        let { completed } = await AppLauncher.openUrl({ url: data.androidLink });
        if(completed)
          return;
      }
    }
    Browser.open({url: data.webLink});
  }
}