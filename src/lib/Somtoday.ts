import { Http, HttpOptions } from '@capacitor-community/http';
import { NoTokenError } from './GlobalErrorHandler';
import { AskLogin, Savable, Token } from './Utils';

export class SomtodayData {
    public access_token: Token = new Token();
    public refresh_token: Token = new Token();
    public user_id: number = -1;
}

export class Somtoday extends AskLogin implements Savable<SomtodayData> {
    public static client_id: string = "D50E0C06-32D1-4B41-A137-A9A850C892C2"; //static id for student version of somtoday
    public static LVOBuuid = "d091c475-43f3-494f-8b1a-84946a5c2142"; //static id for lvob
    public static tokenEndpoint = "https://inloggen.somtoday.nl/oauth2/token"; // endpoint for all token requests
    public static baseEndpoint = "https://api.somtoday.nl/rest/v1/"; // endpoint for all other requests
    public static loginLink = "https://somtoday.nl/oauth2/authorize?redirect_uri=somtodayleerling://oauth/callback&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&response_type=code&prompt=login&state=UNlYiXONB69K8uNwNJ2rCw&scope=openid&code_challenge=tCqjy6FPb1kdOfvSa43D8a7j8FLDmKFCAz8EdRGdtQA&code_challenge_method=S256&tenant_uuid=788de26b-bf5a-46d5-bb58-f35ff7bdd172&oidc_iss=https://login.microsoftonline.com/788de26b-bf5a-46d5-bb58-f35ff7bdd172/v2.0&session=no_session";
    public refresh_token: Token = new Token();
    public user_id: number = -1;
    public name: string = "Somtoday";
    constructor(tokenUpdate: ((a: Token) => void) | undefined){
        super()
        this.access_token.onUpdateToken = tokenUpdate;
    }
    simplify(): SomtodayData {
        return {access_token: this.access_token, refresh_token: this.refresh_token, user_id: this.user_id};
    }
    public readFromObject(simple: SomtodayData): void {
        this.user_id = simple.user_id;
        this.refresh_token.setValue(simple.refresh_token);
        this.access_token.setValue(simple.access_token);
    }
    public async resolveToken(): Promise<Token> {
        if (!this.refresh_token.isValid) {
            throw new NoTokenError(this);
        } else
            return await this.getToken("refresh_token", this.refresh_token.value);
    }
public async getToken(grant_type: string, grant_value: string, extra_parms?: { [name: string]: string }): Promise<Token> {//get token via refresh or password grand type
    let params: { [name: string]: string }  = {
        "grant_type": grant_type,
        "scope": "openid",
        "client_id": Somtoday.client_id
    };
    if(grant_value != "")
    params[grant_type] = grant_value;
    if (extra_parms != null)
        for (let extra_name in extra_parms)
            params[extra_name] = extra_parms[extra_name];
    let options: HttpOptions = {
        url: Somtoday.tokenEndpoint,
        params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    };
    let result = (await Http.post(options)).data;//this.post(Somtoday.tokenEndpoint, urlencoded, { "Content-Type": "application/x-www-form-urlencoded" });
    this.refresh_token.setValues(result.refresh_token, 30 * 12 * 3600 * 1000 + new Date().getTime());
    this.access_token.setValues(result.access_token, 3600 * 1000 + new Date().getTime())
    let student = await this.getStudent();
    this.user_id = student.items[0].links[0].id;
    if(this.access_token.onUpdateToken !== undefined)
        this.access_token.onUpdateToken(this.access_token);
    return this.access_token;//return the token
}
public async getPasswordToken(username: string, password: string): Promise<Token> {
    return await this.getToken("password", password, { "username": Somtoday.LVOBuuid + "\\" + username });
}
public async getStudent() {//gets user data
    await this.checkAccessToken();
    let options: HttpOptions = {
        url: Somtoday.baseEndpoint + "leerlingen",
        headers: { "Authorization": "Bearer " + this.access_token.value, "Accept": "application/json" }
    };
    return (await Http.get(options)).data;
}
public async getScedule(firstday: Date, lastday: Date): Promise<afsprakenResult> {//gets the scedule between two dates
    await this.checkAccessToken();

    
    const padded = (.1 + "").padStart(6, "0");

    let begindate = firstday.getFullYear() + "-" + ((firstday.getMonth() + 1) + "").padStart(2, "0") + "-" + (firstday.getDate() + "").padStart(2, "0");
    let enddate = lastday.getFullYear() + "-" + ((lastday.getMonth() + 1) + "").padStart(2, "0") + "-" + (lastday.getDate() + "").padStart(2, "0");
    //alert(begindate);
    //alert(enddate);
    let url = Somtoday.baseEndpoint + "afspraken?sort=asc-id&additional=vak&additional=docentAfkortingen"+ /*"&additional=leerlingen"+*/"&begindatum=" + begindate + "&einddatum=" + enddate;
    let options: HttpOptions = {
        url,
        headers: { "Authorization": "Bearer " + this.access_token.value, "Accept": "application/json" },
    };
    return (await Http.get(options)).data;
    //return JSON.parse(tempRespns);
}
public async getGrades(): Promise<resultatenResult> {//gets the scedule between two dates
    await this.checkAccessToken();
    let url = Somtoday.baseEndpoint + "resultaten/huidigVoorLeerling/" + this.user_id;
    let options: HttpOptions = {
        url,
        headers: { "Authorization": "Bearer " + this.access_token.value, "Accept": "application/json",'Range':'items=0-600' },
    };
    //let grades = (await Http.get(options)).data;
    //let gradeDict: { [name: string]: number[] } = {};
    //for (let i = 0; i < grades.items.length; i++) {
    //    let grade = grades.items[i];
    //    if(gradeDict.hasOwnProperty(grade.vak.naam)){
    //        gradeDict[grade.vak.naam].push(grade);
    //    } else {
    //        gradeDict[grade.vak.naam] = [grade];
    //    }
    //}
    return (await Http.get(options)).data;
    //return JSON.parse(tempRespns2);
}
public async getCodeToken(code: string): Promise<Token> {
        return await this.getToken("authorization_code", "", {
            "redirect_uri":"somtodayleerling://oauth/callback",
            "code_verifier":"t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ",
            "code":code,
        });
}
}

export type afsprakenResult = {
    items: {
        links:[
            {
                id:number
            }
        ],
        additionalObjects:{
            docentAfkortingen:string,
            vak: Vak | null
        },
        afspraakType:{
            activiteit: string,
            presentieRegistratieDefault: boolean,
            actief: boolean,
            categorie: string,
            omschrijving: string,
            naam: string
        },
        locatie: string,
        beginDatumTijd: string,
        eindDatumTijd: string,
        titel: string,
        omschrijving: string,
        presentieRegistratieVerplicht: boolean,
        presentieRegistratieVerwerkt: boolean,
        afspraakStatus: string
    }[]
};
export type Vak = {
    afkorting: string,
    naam: string
}
export type resultatenResult = {
    items: {
        type: string,
        datumInvoer: string,
        leerjaar: number,
        periode: number,
        vak: Vak,
        examenWeging?: number,
        weging?: number,
        omschrijving?: string,
        resultaat?: number,
        geldendResultaat?: number
    }[]
}