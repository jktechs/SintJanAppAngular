import { GetResult, Preferences } from '@capacitor/preferences';
import { Action } from './Zermelo';
export abstract class Savable<M> {
    abstract simplify(): M;
    abstract readFromObject(simple: M): void;
    public static async Load<B, T extends Savable<B>>(key: string, defaultValue: T): Promise<T> {
        let result: GetResult = await Preferences.get({key});
        let value: T = defaultValue;
        if(result.value !== null) {
            let obj: B | undefined = tryJSONParse(result.value);
            if(obj !== undefined)
                value.readFromObject(obj);
            else
                await this.Save(key, value);
        } else
            await this.Save(key, value);
        return value;
    }
    public static async Save<B, T extends Savable<B>>(key: string, value: T) {
        await Preferences.set({key, value: JSON.stringify(value.simplify())});
    }
}
export abstract class AskLogin {
    async checkAccessToken(): Promise<Token> {
        if (!this.access_token.isValid) {//if normal token if exipiered
            return await this.resolveToken();
        } else//if none have expiered return token
            return this.access_token;
    }
    public access_token: Token = new Token();
    public abstract name: string;
    abstract resolveToken(): Promise<Token>;
}
export class Token {
    private expire_time: number;
    private _value: string;
    onUpdateToken: ((a: Token) => void) | undefined;
    constructor(value = "", expire_time = 0){
        this._value =value;
        this.expire_time = expire_time;
    }
    toString(): string {
        return "("+this.value+","+this.expire_time+")";
    }
    public setValues(value: string, expire_time: number) {
        this._value = value;
        this.expire_time = expire_time;
        if(this.onUpdateToken !== undefined)
            this.onUpdateToken(this);
    }
    public setValue(t: Token){
        this._value = t._value;
        this.expire_time = t.expire_time;
        if(this.onUpdateToken !== undefined)
            this.onUpdateToken(this);
    }
    public get value(): string {
        return this._value;
    }
    public get isValid(): boolean {
        return new Date().getTime() < this.expire_time;
    }
}
export class JSONObject<T> implements Savable<T> {
    public value: T;
    constructor(value: T){
        this.value = value;
    }
    simplify(): T {return this.value}
    readFromObject(simple: T): void {this.value = simple}
}
export function getWeekDates(yearNum: number, weekNum: number, numOfWeeks: number): {begin: Date, end: Date} {
    let begin = new Date(yearNum, 0, 1);
    begin.setDate(2-begin.getDay() + weekNum*7);
    let end = new Date(begin);
    end.setDate(end.getDate() + 7*numOfWeeks);
    return {begin, end};
}
export class Location {
    private static regex: RegExp = new RegExp("^([^0-9]+)([0-9])([0-9]{2})");
    private original: string;
    building: string = "E";
    floor: number = 0;
    roomId: number = 0;
    constructor(text: string) {
        this.original = text;
        let result: RegExpMatchArray | null = Location.regex.exec(text);
        if(result !== null){
            this.building = result[1];
            this.floor = parseInt(result[2]);
            this.roomId = parseInt(result[3]);
        }
    }
    toString() { return this.building.toString() + this.floor + pad(this.roomId,2); }
}
export class Lesson {
    constructor(name: string, loc: Location, dnum: number, wnum: number, snum: number, endnum: number){
        this.name = name;
        this.location = loc;
        this.dayNumber = dnum;
        this.weekNumber = wnum;
        this.start = snum;
        this.end = endnum;
        this.options = [];
    }
    dayNumber: number;
    weekNumber: number;
    location: Location;
    start: number;
    end: number;
    homework?: string;
    name: string;
    options: Action[];
}
export class Week {
    index: number;
    days: [Lesson[], Lesson[], Lesson[], Lesson[], Lesson[], Lesson[], Lesson[]] = [[],[],[],[],[],[],[]]
    constructor(index: number = -1) {
        this.index = index;
    }
}
export class Subject {
  name: string = "";
  weeks: Week[] = [];
  grades: Grade[] = [];
  average?: Grade;
}
export type Grade = {
    value: number,
    weight: number,
    discriptor: string,
}
export function pad(num: number, size: number): string {
    let sNum = num.toString();
    while (sNum.length < size) sNum = "0" + sNum;
    return sNum;
}
export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
export class Mutex {
    public available: boolean = true;
    private waiting: {func: (()=>Promise<void>), done: ((value: void | PromiseLike<void>) => void)}[] = [];
    constructor(){}
    public use(executor: ()=>Promise<void>): Promise<void> {
        return new Promise((resolve)=>{
            this.waiting.push({func: executor, done: resolve})
            this.check()
        })
    }
    private async check() {
        if(!this.available) return;
        this.available = false;
        let item: {func: (()=>Promise<void>), done: ((value: void | PromiseLike<void>) => void)} | undefined;
        while((item = this.waiting.pop()) !== undefined) {
            await item.func()
            let tmp = item;
            setTimeout(()=>{tmp.done()}, 0)
        }
        this.available = true;
    }
    public async wait(): Promise<() => void> {
        return new Promise((resolve) => {
            this.waiting.push({func: ()=>{
                return new Promise((resolve2)=>{
                    resolve(resolve2)
                });
            }, done: ()=>{}})
            this.check()
        })
    }
}
export function setVar(value: any, name: string){
    // @ts-ignore
    window[name] = value;
}
export function tryJSONParse(text: string): any | undefined {
    let result: any | undefined = undefined;
    try{
        result = JSON.parse(text)
    } catch(e){
        if(!(e instanceof SyntaxError))
            throw e;
    }
    return result;
}