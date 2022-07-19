import {Component} from '@angular/core';
import {Web3Service} from './services/contract/web3.service';
import {UserAuthService} from './services/user.service';
import {data} from 'autoprefixer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  authenticated: boolean = false;
  data: string[] | undefined;


  constructor(
    private userService: UserAuthService,
    private web3: Web3Service) {
  }


  Connect() {
    this.web3.connectAccount().then(response => {
      // console.log(response);
      this.data = response
      console.log(this.data);
      // console.log(this.web3.publicAddress());
      // @ts-ignore
      this.userService.login(this.data[0])
        .subscribe((result) => {
          console.log(result);
          if (Object.entries(result.userObj).length === 0) {
            // @ts-ignore
            this.handleSignup(this.data[0]);
          } else {
            this.handleSignIn(result.userObj);
          }
        });
    });
  }

  async handleSignIn(userObj: any) {
    try {
      let resultObj = await this.web3.signIn(`I am signing my one-time nonce: ${userObj.nonce}`, userObj.publicAddress);
      console.log(resultObj, 'result');
      this.userService.authenticate({signature: resultObj, publicAddress: userObj.publicAddress})
        .subscribe((result) => {
          console.log(result);
        });
    } catch (e) {
      console.log(e);
    }
  }

  handleSignup(data: any) {
    this.userService.signUp(data)
      .subscribe((result) => {
        console.log(result);
      });
  }

}
