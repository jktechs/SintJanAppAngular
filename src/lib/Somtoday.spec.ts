import { NoTokenError } from "./GlobalErrorHandler";
import { Somtoday } from "./Somtoday";
import { Token } from "./Utils";

describe('Somtoday', () => {
  it(`name should be 'Somtoday'`, () => {
    let s = new Somtoday(()=>{});
    expect(s.name).toEqual('Somtoday');
  });
  it(`when saved no data should be lost`, () => {
    let s = new Somtoday(()=>{});
    s.access_token = new Token("ABCDE", 12345);
    s.refresh_token = new Token("OIJNCSOI", 830947);
    s.user_id = 92938;
    let b = new Somtoday(()=>{});
    b.readFromObject(s.simplify());
    expect(b.user_id).toEqual(s.user_id);
    expect(b.access_token).toEqual(b.access_token);
    expect(b.refresh_token).toEqual(b.refresh_token);
  });
  it(`checkAccessToken should throw an error when token is not valid`, (done) => {//done
    let s = new Somtoday(()=>{});
    expect(!s.access_token.isValid).toBeTruthy();
    s.checkAccessToken().catch((e)=>{
      if(e instanceof NoTokenError)
        done();
    });
  });
  it(`when token changes onTokenUpdate should be called`, (done) => {
    let s = new Somtoday((a: Token)=>{
        expect(a).toEqual(s.access_token);
        done();
    });
    s.access_token.setValues("PDFE",34509);
  });
});
