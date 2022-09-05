import { Http, HttpOptions } from "@capacitor-community/http";
import { NoTokenError } from "./GlobalErrorHandler";
import { Somtoday } from "./Somtoday";
import { AskLogin, pad, Savable, Token } from "./Utils";

export class ZermeloData {
    public access_token: Token = new Token();
    public username: string = "";
    public firstname: string | undefined;
    public lastname: string | undefined;
}

export class Zermelo extends AskLogin implements Savable<ZermeloData> {
    public name: string = "Zermelo";
    public static baseEndpoint: string = "https://sint-janscollege.zportal.nl/api/v3/"; // endpoint for all other requests
    public static loginLink: string = "https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676?tenantId=788de26b-bf5a-46d5-bb58-f35ff7bdd172";
    public firstname: string | undefined;
    public lastname: string | undefined;
    public username: string = "";
    public readFromObject(simple: ZermeloData): void {
        this.access_token.setValue(simple.access_token);
        this.username = simple.username;
        this.firstname = simple.firstname;
        this.lastname = simple.lastname;
    }
    simplify(): ZermeloData {
        return {access_token: this.access_token, firstname: this.firstname, lastname: this.lastname, username: this.username};
    }
    constructor(tokenUpdate: ((a: Token) => void) | undefined){
        super()
        this.access_token.onUpdateToken = tokenUpdate;
    }   
    public async resolveToken(): Promise<Token> {
        throw new NoTokenError(this);
    }
    public async getToken(code: string): Promise<Token> {//get token via refresh or password grand type
        let options: HttpOptions = {
            url: Zermelo.baseEndpoint + "oauth/token",
            params: {
                "grant_type": "authorization_code",
                "code": code 
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        let result = await Http.post(options);
        await this.getTokenData(result.data.access_token);
        return this.access_token;
    }
    public async getTokenData(code: string) {
        let options: HttpOptions = {
            url: Zermelo.baseEndpoint + "tokens/~current?access_token=" + code,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        let result = await Http.get(options);
        this.access_token.setValues(code, result.data.response.data[0].expires * 1000)
        this.username = result.data.response.data[0].user;
    }
    public async getStudent() {//gets user data
        await this.checkAccessToken();
        let options: HttpOptions = {
            url: Zermelo.baseEndpoint + "users?access_token=" + this.access_token + "&code=" + this.username + "&fields=lastName,code,prefix,firstName",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        let result = await Http.get(options);
        this.firstname = result.data.response.data[0].firstName;
        this.lastname = result.data.response.data[0].lastName;
        return this;
    }
    public async getScedule(year: number, week: number) {//gets the scedule between two dates
        await this.checkAccessToken();
        let options: HttpOptions = {
            url: Zermelo.baseEndpoint + "liveschedule?access_token=" + this.access_token + "&student=" + this.username + "&week="+year+pad(week,2),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        let result = await Http.get(options);
        return result.data.response.data[0].appointments;
    }
}