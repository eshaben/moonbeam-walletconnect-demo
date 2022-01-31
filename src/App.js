import './App.css';
import logo from "./logo.png"
import React from 'react';
import styled from 'styled-components';
// import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers, providers } from "ethers";
import { Web3 } from "web3";
import WalletConnectProvider from '@walletconnect/ethereum-provider'

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
  provider: null,
}
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {...INITIAL_STATE};
  }

  connect = async () => {
    this.setState({ fetching: true })

    // create new connector
    const provider = new WalletConnectProvider({
      rpc: {1287: "https://moonbeam-alpha.api.onfinality.io/rpc?apikey=ddd4b858-48ac-4637-b023-7a15fcca2be1"},
      pollingInterval: 50000,
    })

    // const provider = new WalletConnectProvider({
    //   rpc: { 137: "https://rpc-mainnet.matic.network" }
    // })

    await provider.enable()

    // const walletConnector = provider.wc
    this.setState({ connector: provider });

    // check if already connected
    if (!provider) {
      // create new session
      console.log("do we ever get here??")
      await provider.createSession({ chainId: provider.chainId })
    }

    const web3Provider = new Web3.provider(provider);
    const account = "0xdbE47E1D60D8f1D68CdC786d2FF18139eD4E0636"
    const balance = web3Provider.utils.fromWei(await web3Provider.eth.getBalance(account), 'ether')
    console.log(`balance = ${balance}`)

    this.subscribeToEvents();
  };

  onConnect = async (payload) => {
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];

    this.setState({
      connected: true,
      chainId,
      accounts,
      address,
    });
  }

  subscribeToEvents = async () => {
    const { connector, provider } = this.state;

    connector.on("connect", async (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("hello? connect?")

      const web3Provider = new providers.Web3Provider(provider);
      // const web3Provider = new Web3(provider)
      console.log(web3Provider)
      const account = payload.params[0].accounts[0];
      console.log(account)

      let balance = ""
      try {
        balance = await web3Provider.getBalance(account);
      } catch(e) {
        console.log(e)
      }
      // const balance = ethers.utils.formatEther(await web3Provider.getBalance(account))
      console.log(`balance = ${balance}`)

      // this.onConnect(payload)
    });

    // if (!provider.connected) {
    //   return;
    // }

    // console.log("yes provider is present")

    // connector.on("connect", () => {
    //   console.log("connector connected??")
    // })

    // provider.on("connect", () => {
    //   console.log("hellooyellow?")
    // })

    // console.log("HIII", provider)
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
