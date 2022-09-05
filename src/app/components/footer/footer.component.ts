import { Component, ContentChild, OnInit } from '@angular/core';
import { NavigationComponent } from '../navigation/navigation.component';
import { ListItemDirective } from '../navigation/navigation.directive';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  buttons: ButtonData[] | undefined;
  navComp: NavigationComponent | undefined;

  @ContentChild(NavigationComponent) set navigation(v: NavigationComponent) {
    this.navComp = v;
    v.onUpdateItems = () => {
      this.buttons = [];
      this.navComp?.mutex.use(async ()=>{
        this.navComp?.items.forEach(item => {
          if(item.name == ListItemDirective.defaultName) return;
          let button: ButtonData = new ButtonData();
          button.directive = item;
          this.buttons?.push(button);
        });
      })
    }
  }
  constructor() { }
  onButtonClick(item: ButtonData): void {
    if(item.directive !== undefined)
      this.navComp?.setActive(item.directive);
  }
  ngOnInit(): void {
  }
}
export class ButtonData {
  directive: ListItemDirective | undefined;
  public get name() : string | undefined {
    return this.directive?.name;
  }
  
}