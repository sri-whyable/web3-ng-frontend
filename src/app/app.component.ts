import {Component} from '@angular/core';
import {Web3Service} from './services/contract/web3.service';
import {UserAuthService} from './services/user.service';
import {
  getChainOptions, WalletController, WalletStatus, UserDenied,
  ConnectType, CreateTxFailed, TxFailed, Timeout, TxUnspecifiedError
} from '@terra-money/wallet-provider';
import {Fee, MsgSend} from '@terra-money/terra.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  authenticated: boolean = false;
  data: string[] | undefined;
  terraController: WalletController | undefined;
  walletConnected = false;
  walletAddress = '';
  tnDetails: any;


  constructor(
    private userService: UserAuthService,
    private web3: Web3Service) {
    this.walletInit().then(r => console.log(r));
  }

  async walletInit() {
    const chainOptions = await getChainOptions();
    console.log(chainOptions, 'chainOptions');

    this.terraController = new WalletController({
      ...chainOptions,
    });
    console.log(this.terraController, 'terraController');

    this.terraController.states().subscribe(async (states) => {
      console.log(states, 'states');
      switch (states.status) {
        case WalletStatus.WALLET_NOT_CONNECTED:
          this.walletConnected = false
          this.walletAddress = ''
          break;

        case WalletStatus.WALLET_CONNECTED:
          this.walletConnected = true
          this.walletAddress = states.wallets[0].terraAddress
          break;
      }
    });
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

  async walletConnect() {
    let connect = await this.terraController?.connect(ConnectType.EXTENSION);
    console.log(connect);
  }

  async postTn() {
    let txResult;
    try {
      txResult = await this.terraController?.post({
        fee: new Fee(100000, '20000uusd'),
        msgs: [
          new MsgSend(
            this.walletAddress,
            'terra1qxzjv7spze07t4vjwjp3q2cppm0qx5esqvngdx',
            {
              uusd: 1,
            },
          ),
        ],
      });
    } catch (error: unknown) {
      // setLoading(false);
      console.error(error);
      if (error instanceof UserDenied) {
        alert('User Denied');
      } else if (error instanceof CreateTxFailed) {
        alert(`Create Tx Failed: ${error.message}`);
      } else if (error instanceof TxFailed) {
        alert(`Tx Failed: ${error.message}`);
      } else if (error instanceof Timeout) {
        alert('Timeout');
      } else if (error instanceof TxUnspecifiedError) {
        alert(`Unspecified Error: ${error.message}`);
      } else {
        alert(
          `Unknown Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    console.log(txResult);

    if (txResult) {
      // this.tnDetails = JSON.stringify(txResult, null, '\t').replace(/([{},:])/g, ' $1 ');
      const temp = JSON.stringify(txResult);
      this.tnDetails = temp.replace(/\\/g, '');
      console.log(txResult.msgs[0]);
      console.log(txResult.result);
    }
    if (!txResult) {
      alert('Could not post transaction properly');
      return;
    }
  }
}
