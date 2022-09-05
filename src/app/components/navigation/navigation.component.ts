import { Component, OnInit, QueryList, ContentChildren, TemplateRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { delay, Mutex } from 'src/lib/Utils';
import { ListItemDirective } from './navigation.directive';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  public items: ListItemDirective[] = [];
  public mutex: Mutex = new Mutex();
  public static pageHistory: ListItemDirective[] = [];
  public get lastPage(): ListItemDirective {
    if(NavigationComponent.pageHistory.length === 0)
      return this.items[0];
    return NavigationComponent.pageHistory[NavigationComponent.pageHistory.length-1]
  }
  @ContentChildren(ListItemDirective) set listItems(list: QueryList<ListItemDirective>) {
    this.mutex.use(async ()=>{
      list.forEach(el => this.items.push(el));
    })
  }
  private activeElement: ListItemDirective | undefined;
  onUpdateItems: (() => void) | undefined;
  constructor() {}
  public static instance: NavigationComponent;
  private handle: PluginListenerHandle | undefined;
  ngOnInit(): void {
    NavigationComponent.instance = this;    
    this.handle = App.addListener('backButton', ()=>{
      this.back();
    })
  }
  ngOnDestroy(): void {
    this.handle?.remove();
  }
  ngAfterContentInit(): void {
    if(this.onUpdateItems !== undefined)
      this.onUpdateItems();
    setTimeout(() => {
      this.setActive(this.lastPage);
    }, 100);
  }
  public async setActive(item: ListItemDirective, push: boolean = true) {
    let done = await this.mutex.wait();
    if(item === this.activeElement) {
      done()
      return;
    }
    let newItemIndex: number = this.items.indexOf(item);
    if(push)
      NavigationComponent.pageHistory.push(item);

    //let str = "";
    //for(let i = 0;i<NavigationComponent.pageHistory.length;i++)
    //  str += NavigationComponent.pageHistory[i].name + "\n";
    //alert(str)
    //alert(this.activeElement?.name)

    this.items[newItemIndex] = this.items[1];
    this.items[1] = item;

    item.isAnimating = true;
    item.active = true;
    await delay(250);

    item.isAnimating = false;
    if(this.activeElement !== undefined) this.activeElement.active = false;
    
    this.items[1] = this.items[0];
    this.items[0] = item;

    this.activeElement = item;

    if(this.items.findIndex(item => item.active) === -1) {
      item.active = true;
    }
    done()
  }
  public async back(): Promise<void> {
    if(NavigationComponent.pageHistory.length <= 1) return;
    NavigationComponent.pageHistory.pop();
    await this.setActive(this.lastPage, false);
  }
}
export class ListItemsData {
  itemTemplate: TemplateRef<any> | undefined;
  active: boolean = false;
}