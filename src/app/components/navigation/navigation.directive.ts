import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[appListItem]'
})
export class ListItemDirective {
    @Input() set appListItem(name: string) {
        this.name = name;
    }
    public static defaultName: string = "tempName";
    public itemTemplate: TemplateRef<any>;
    public active: boolean = false;
    public name: string = ListItemDirective.defaultName;
    public isAnimating: boolean = false;
    public data: any;

    constructor(private templateRef: TemplateRef<any>) {
        this.itemTemplate = this.templateRef;
    }
}