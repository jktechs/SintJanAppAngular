import { Component, OnInit, QueryList, ContentChildren, TemplateRef, OnDestroy, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { Mutex } from 'src/lib/Utils';
import { ListItemDirective } from './navigation.directive';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  public subjectPage: ListItemDirective | undefined;
  public kwtPage: ListItemDirective | undefined;
  public items: ListItemDirective[] = [];
  public mutex: Mutex = new Mutex();
  public static pageHistory: {directive: ListItemDirective, data?: any}[] = [];
  public get lastPage(): ListItemDirective {
    if(NavigationComponent.pageHistory.length === 0)
      return this.items[0];
    return NavigationComponent.pageHistory[NavigationComponent.pageHistory.length-1].directive
  }
  @ContentChildren(ListItemDirective) set listItems(list: QueryList<ListItemDirective>) {
    this.mutex.use(async ()=>{
      list.forEach(el => this.items.push(el));
    })
  }
  public activeElement: ListItemDirective | undefined;
  onUpdateItems: (() => void) | undefined;
  constructor(private zone: NgZone) {
    this.handle = App.addListener('backButton', ()=>{
      zone.run(()=>{
        this.back();
      })
    })
  }
  public static instance: NavigationComponent;
  private handle: PluginListenerHandle | undefined;
  ngOnInit(): void {
    NavigationComponent.instance = this;
  }
  ngOnDestroy(): void {
    this.handle?.remove();
  }
  ngAfterContentInit(): void {
    if(this.onUpdateItems !== undefined)
      this.onUpdateItems();
    setTimeout(() => {
      this.subjectPage = this.items[4];
      this.kwtPage = this.items[5];
      this.setActive(this.lastPage);
    }, 100);
  }
  public async setActive(item: ListItemDirective, data?: any) {
    let done = await this.mutex.wait();
    if(item === this.activeElement) {
      done()
      return;
    }
    let newItemIndex: number = this.items.indexOf(item);
    

    this.items[newItemIndex] = this.items[1];
    this.items[1] = item;

    item.isAnimating = true;
    item.active = true;
    let oldItem = this.activeElement;

    this.activeElement = item;
    if(data !== undefined)
      this.activeElement.data = data;
    
    NavigationComponent.pageHistory.push({directive: this.activeElement, data: this.activeElement.data});
    
    await new Promise( resolve => setTimeout(resolve, 250) );

    item.isAnimating = false;
    if(oldItem !== undefined) oldItem.active = false;
    
    this.items[1] = this.items[0];
    this.items[0] = item;


    if(this.items.findIndex(item => item.active) === -1) {
      item.active = true;
    }
    done()
  }
  public async back(): Promise<void> {
    if(NavigationComponent.pageHistory.length < 2){
      App.exitApp();
      return;
    }
    NavigationComponent.pageHistory.pop();
    let newPage = NavigationComponent.pageHistory.pop();
    if(newPage === undefined) return;
    await this.setActive(newPage.directive, newPage.data);
  }
}
export class ListItemsData {
  itemTemplate: TemplateRef<any> | undefined;
  active: boolean = false;
}