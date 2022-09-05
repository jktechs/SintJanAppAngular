import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { AskLogin } from "./Utils";

export class handleableError extends Error {
    handle(): {fatal: boolean, log: boolean} {
        return {fatal: true, log: true};
    }
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    alert: boolean = true;
  constructor(
    private zone: NgZone
  ) {}

  handleError(error: any) {
    if(error.promise instanceof Promise) {
        error.promise.catch((e: Error) => {
            if(e instanceof handleableError) {
                let handle = e.handle();
                if(handle.log) this.log(e, handle.fatal);
            } else
                this.log(e.toString()+e.stack);
        })
    } else
        this.log(error);
  }
  log(error: any, fatal: boolean = true) {
    if(fatal)
        console.error(error);
    else
        console.log(error);
    if(this.alert && fatal)
        alert(error);
  }
}
export class NoTokenError extends handleableError {
    public cause: AskLogin;
    constructor(cause: AskLogin){
        super("No valid token for "+cause.name+".");
        this.name = "NoTokenError";
        this.cause = cause;
    }
}