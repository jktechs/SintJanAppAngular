import { Component, OnInit } from '@angular/core';
import { afsprakenResult, resultatenResult, Somtoday } from 'src/lib/Somtoday';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Zermelo } from 'src/lib/Zermelo';
import { Browser } from '@capacitor/browser';
import { JSONObject, Savable, Subject, Location, Lesson, Week, setVar } from 'src/lib/Utils';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';

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
    let result: afsprakenResult = await AppComponent.somtoday.getScedule(new Date("2022-09-05T00:00"), new Date("2022-09-26T00:00"));
    for(let i = 0;i<result.items.length;i++) {
      let start = new Date(result.items[i].beginDatumTijd);
      let week = this.getWeek(start);
      let day = (start.getDay()-1) - Math.floor((start.getDay()-1)/7)*7;
      let minutes = start.getMinutes()+start.getHours()*60;
      let end = new Date(result.items[i].eindDatumTijd);
      let endMinutes = end.getMinutes()+end.getHours()*60;
      let subject = result.items[i].additionalObjects.vak;
      let name = "idk";
      if(subject !== null)
       name = subject.naam;
      if(!Object.keys(AppComponent.data.value.subjects).includes(name)){
        let s = new Subject();
        s.name = name;
        AppComponent.data.value.subjects[name] = s;
      }
      let s = AppComponent.data.value.subjects[name];
      if(s instanceof Subject){
        let weekIndex = s.weeks.findIndex(x=>{return x.index == week;})
        let lesson = new Lesson(result.items[i].titel, new Location(result.items[i].locatie.toUpperCase()), day, week, minutes, endMinutes)
        if(weekIndex !== -1) {
          s.weeks[weekIndex].days[day].push(lesson)
        } else {
          let w: Week = new Week(week);
          let all: [Lesson[], Lesson[], Lesson[], Lesson[], Lesson[], Lesson[], Lesson[]] = [[],[],[],[],[],[],[]];
          all[day].push(lesson)
          w.days = all;
          s.weeks.push(w);
        }
      }
    }
    let result2: resultatenResult = await AppComponent.somtoday.getGrades();
    for(let i = 0;i<result2.items.length;i++){
      let item = result2.items[i]
      let name = item.vak.naam;
      if(!Object.keys(AppComponent.data.value.subjects).includes(name)){
        let s = new Subject();
        s.name = name;
        AppComponent.data.value.subjects[name] = s;
      }
      if(item.type === 'Toetskolom' && item.geldendResultaat !== undefined && item.weging !== undefined) {
        AppComponent.data.value.subjects[name]?.grades.push({value: item.geldendResultaat, weight: item.weging, discriptor: item.omschrijving === undefined?"":item.omschrijving, average: false})
      } else if(item.type === 'SEGemiddeldeKolom' && item.geldendResultaat !== undefined) {
        AppComponent.data.value.subjects[name]?.grades.push({value: item.geldendResultaat, weight: 0, discriptor: item.omschrijving === undefined?"":item.omschrijving, average: true})
      }
    }
    setVar(this.getWeek, "getWeek")
    AppComponent.zermelo.checkAccessToken();
  }
  getWeek(currentdate: Date): number {
    var oneJan = new Date(currentdate.getFullYear(),0,1);
    oneJan.setDate(oneJan.getDate()-oneJan.getDay()+1);
    if(oneJan.getFullYear() !== currentdate.getFullYear())
      oneJan.setDate(oneJan.getDate()+7);
    return Math.floor((currentdate.getTime() - oneJan.getTime()) / (24 * 3600 * 1000 * 7))+1;
  }
  public static linkSettings: {[name: string]: {androidLink: string, iosLink: string, webLink: string}} = {
    "zermelo": {webLink: Zermelo.loginLink, androidLink: "", iosLink: ""},
    "office": {webLink: "https://www.office.com/", androidLink: "", iosLink: ""},
    "sintjan": {webLink: "https://www.sintjan-lvo.nl/", androidLink: "", iosLink: ""},
  }
  link(name: string): void {
    AppComponent.openLink(name);
  }
  public static openLink(name: string): void {
    alert("open: "+name);
    if(!Object.keys(AppComponent.linkSettings).includes(name)) return;
    Browser.open({url: AppComponent.linkSettings[name].webLink});
  }
}