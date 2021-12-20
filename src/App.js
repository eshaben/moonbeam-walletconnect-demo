import './App.css';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import React from 'react';

// import Modal from "./components/Modal";

const INITIAL_STATE = {
  connector: null,
  chainID: 1287,
  accounts: [],
  address: null
}
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {...INITIAL_STATE};
  }

  connect = async () => {
    console.log("clicked")

    const connector = new WalletConnect({
      rpc: { [this.state.chainId]: 'https://rpc.testnet.moonbeam.network' },
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: true
    })

    const {accounts, chainId} = await connector.connect()

    QRCodeModal.open("objective-jones-c0dc6e.netlify.app", () => {
      console.log("opened")
    })

    console.log("connected: ", accounts, chainId)

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Moonbeam/Wallet Connect Demo App
          </p>
          <button
            className="App-link"
            target="_blank"
            onClick={this.connect}
          >
            Connect to WalletConnect
          </button>
        </header>
      </div>
    );
  }
}

export default App;
