import './App.css';
import logo from "./logo.png"
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import React from 'react';
import styled from 'styled-components';
import { ethers } from "ethers"
import { SUPPORTED_CHAINS } from "./helpers/chains";

const Wrapper = styled.div`
  font-family: 'Varela Round', sans-serif;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10em;
`

const Header = styled.h1`
  font-size: 2em;
  margin-bottom: 1em;
`

const LoadedData = styled.div`
  margin: 1em;
  align-self: center;
`

const Data = styled.p`
  font-size: 1.2em;
`

const Button = styled.button`
  padding: 1em;
  background: #53cbc9;
  font-size: 1em;
  border: none;
  border-radius: .3em;
  font-family: 'Varela Round', sans-serif;
  :hover {
    transform: scale(1.1);
    cursor: pointer;
  }
`

const OutlinedButton = styled(Button)`
  background: #ffffff;
  border: 1px solid #53cbc9;
  display: flex;
  margin: auto;
  margin-top: 3em;
`

const INITIAL_STATE = {
  connector: null,
  chainId: null,
  accounts: [],
  address: null,
  fetching: false,
  addressBalance: null,
}
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {...INITIAL_STATE};
  }

  connect = async () => {
    this.setState({ fetching: true })
    
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
    this.setState({ connector });

    // check if already connected
    if (!connector.connected) {
      // create new session
      await connector.createSession();
    }

    // subscribe to events
    this.subscribeToEvents();
  };

  // this ensures the connection is killed on the users mobile device
  killSession = () => {
    const { connector } = this.state;
    if (connector) {
      connector.killSession();
    }
    this.resetApp();
  }

  onConnect = (payload) => {
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];
    this.setState({
      connected: true,
      chainId,
      accounts,
      address,
      fetching: false
    });

    this.getAccountBalance(address)
  };

  getChainData = (chainId) => {
    const chainData = SUPPORTED_CHAINS.filter((chain) => chain.chain_id === chainId)[0];

    if (!chainData) {
      throw new Error("ChainId missing or not supported");
    }

    return chainData
  }

  getAccountBalance = async (address) => {
    const chainData = this.getChainData(this.state.chainId)

    let provider = new ethers.providers.StaticJsonRpcProvider(chainData.rpc_url, {
      chainId: this.state.chainId,
      name: chainData.name
    })

    let balance = await provider.getBalance(address)
    let balanceInMovr = ethers.utils.formatEther(balance)

    this.setState({addressBalance: balanceInMovr})
  }

  sendTransaction = async () => {
    const result = await this.state.connector.sendTransaction({ from: this.state.address, to: "0xDAC66EDAB6e4fB1f6388d082f4689c2Ed1924554", value: "0x1BC16D674EC80000" })
    console.log(result)
  }

  resetApp = () => {
    this.setState({ ...INITIAL_STATE });
  }

  subscribeToEvents = () => {
    const { connector } = this.state

    if (!connector) {
      return;
    }

    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      this.onConnect(payload);
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      this.resetApp();
    })

    // default
    if (connector.connected) {
      const { chainId, accounts } = connector;
      const address = accounts[0];
      this.setState({
        connected: true,
        chainId,
        accounts,
        address,
      });
    }
  }

  render() {
    return (
      <Wrapper>
        <img src={logo} alt="logo" />
        <Content>
          <Header>
            Moonbeam WalletConnect Demo App
          </Header>
          {this.state.connector && this.state.connector.connected && !this.state.fetching ?
            <LoadedData>
              <Data>
                <strong>Connected Address: </strong>
                { this.state.address }
              </Data>
              <Data>
                <strong>Network: </strong>
                { this.state.chainId ? this.getChainData(this.state.chainId).name : null }
              </Data>
              <Data>
                <strong>Chain ID: </strong>
                { this.state.chainId }
              </Data>
              <Data>
                <strong>Balance: </strong>
                {this.state.addressBalance} {this.state.chainId ? this.getChainData(this.state.chainId).native_currency.symbol : null}
              </Data>
              <OutlinedButton
                onClick={this.sendTransaction}
              >
                Sign Transaction
              </OutlinedButton>
              <OutlinedButton
                onClick={this.killSession}
              >
                Disconnect
              </OutlinedButton>
            </LoadedData>
            :
            <Button
              onClick={this.connect}
            >
              Connect to WalletConnect
            </Button>
          }
        </Content>
      </Wrapper>
    )
  }
}

export default App;
