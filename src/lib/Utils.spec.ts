import { delay, Mutex } from "./Utils";

describe('Utils', () => {
  it(`name should be 'Somtoday'`, () => {
  });
  it(`test 2`, (done) => {
    let s = new Mutex();
    let c: number = 0;
    let candone = false;
    s.use(async ()=>{
      candone = true;
      expect(c).toBe(0);
      c++;
    }).then(()=>{
      expect(c).toBe(1);
      if(candone)
      done();
    })
  });
  it(`mutex should work`, (done) => {
    let s = new Mutex();
    let c = 0;
    async function func(){
      await s.use(async ()=>{
        c++;
      })
    }
    Promise.all([func(),func()]).then(()=>{
      expect(c).toEqual(2)
      done()
    })
  });
  it(`no mutex should not work`, (done) => {
    let c = 0;
    async function func(){
      setTimeout(()=>{c++;},0)
    }
    func();
    setTimeout(()=>{expect(c).toEqual(1)
      done()
    }, 1000)
  });
});
  