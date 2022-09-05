import {Component} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { AppComponent } from 'src/app/app.component';
import { BarcodeScanner, CameraDirection, CheckPermissionResult, ScanResult, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { delay, tryJSONParse } from 'src/lib/Utils';
import { Browser } from '@capacitor/browser';
import { Somtoday } from 'src/lib/Somtoday';
import { Zermelo } from 'src/lib/Zermelo';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent {
  codeFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]{12}')]);
  matcher = new MyErrorStateMatcher();
  onSubmit() {
    let code = this.codeFormControl.getRawValue();
    if(code !== null && this.codeFormControl.valid)
      AppComponent.zermelo.getToken(code);
  }
  somLogin(){
    Browser.open({url: Somtoday.loginLink})
  }
  startScanning(){
    this.scan();
  }
  async scan() {
    let result: CheckPermissionResult = await BarcodeScanner.checkPermission({force: true})
    if(result.denied)
      BarcodeScanner.openAppSettings();
    else if(result.granted) {
      AppComponent.instance.visible = false;
      let result: ScanResult = await BarcodeScanner.startScan({cameraDirection: CameraDirection.BACK, targetedFormats: [SupportedFormat.QR_CODE]});
      let data: QRCodeData | undefined;
      if(result.content !== undefined && (data = tryJSONParse(result.content) as QRCodeData | undefined) !== undefined && data.institution === 'sint-janscollege'){
        AppComponent.zermelo.getToken(data.code);
      } else if(result.hasContent) {
        alert("error scanning code")
      }
      AppComponent.instance.visible = true;
    }
  }
}
type QRCodeData = {
  institution: string,
  code: string,
}