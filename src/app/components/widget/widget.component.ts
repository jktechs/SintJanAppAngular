import { Component, Input, OnInit } from '@angular/core';
import { NumberValueAccessor } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.css']
})
export class WidgetComponent implements OnInit {
  @Input() name: string = "";
  @Input() data: WidgetData = new WidgetData();
  constructor() { }

  widgets: {[name: string]: Widget} = {
    link: new Widget(1,1,"white"),
    grades: new Widget(1,2,"blue"),
    homework: new Widget(2,1,"green"),
  }

  widget: Widget = new Widget(0,0,"transparent");

  ngOnInit(): void {
    if(Object.keys(this.widgets).includes(this.name))
      this.widget = this.widgets[this.name];
    this.widget = {...this.widget, ...this.data};
  }
  
  openLink(name: string): void {
    AppComponent.openLink(name);
  }
}
export class Widget {
  width: number;
  height: number;
  color: string;
  x: number = 0;
  y: number = 0;
  [name: string]: any;
  constructor(width: number, height: number, color: string){
    this.width = width;
    this.height = height;
    this.color = color;
  }
}
export class WidgetData {
  x: number = 0;
  y: number = 0;
  [name: string]: any;
}