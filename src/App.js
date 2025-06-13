import { useEffect, useState } from "react";
import "./App.css";
import {ethers} from "ethers";
import faucetContract from "./ethereum/faucet";
function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer,setsigner]=useState("");
  const [fcContract,setfcContract]=useState("");
  const[withdrawlError,setwithdrawlError]=useState("");
    const[withdrawlsuccess,setwithdrawlsuccess]=useState("");
    const[transactionData,settransactionData]=useState("");

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /*get provider*/
        const  provider= new ethers.providers.Web3Provider(window.ethereum);
        //  get account//
        const accounts= await provider.send("eth_requestAccounts",[]);
        /*get signer*/
        setsigner(provider.getSigner());
        /* local contract instance*/
         setfcContract(faucetContract(signer));
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
            /*get provider*/
        const  provider= new ethers.providers.Web3Provider(window.ethereum);
        //  get account//
        const accounts= await provider.send("eth_accounts",[]);
        if (accounts.length > 0) {
          const signer=provider.getSigner();
          /*get signer*/
        setsigner(signer);
        /* local contract instance*/
        
         setfcContract(faucetContract(signer));
       
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };
  const getSThandler=async()=>{
    setwithdrawlError("");
    setwithdrawlsuccess("");
    if(!fcContract || !signer){
      setwithdrawlError("contract or wallet not connected")
      return
    }
   try {
    
       const tx=await fcContract.requestToken();
       console.log("tx sent:",tx.hash);
       const receipt=await tx.wait();
       console.log("receipt",receipt);
       if(receipt.status===1){
         setwithdrawlsuccess("Success enjoy SToken ");
       settransactionData(tx.hash);
       }else{
        setwithdrawlError("Transaction failed try again ");
       }
   } catch (error) {
    // eslint-disable-next-line no-undef
    console.error(error.message);
    // eslint-disable-next-line no-undef
    
    let message=error.reason || error.message;

    if(error.error && error.error.data){
      try{
        const revertdata=error.error.data;
        const reasonhex=revertdata.slice(138);
        const reason=ethers.utils.toUtf8String("0x"+reasonhex);
        message=`X  ${reason}`;

      }catch(e){
        message=error.message;
      }
    }
      else if(error.reason){
        message=`X ${error.reason}`;
      }
      else if(error.message){
        message=`X ${error.message}`;
      }
      setwithdrawlError(message);
    }

   
   }

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">STOKEN (ST)</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1"> SToken Faucet</h1>
            <p>Fast and reliable. 50 OCT/day.</p>
            <div className="mt-3 mb-3 ">
              {withdrawlError && (
               <div className="withdraw-error">{withdrawlError}</div>
              )}
              {withdrawlsuccess && (
                <div className="withdraw-success">{withdrawlsuccess}</div>
              )}{""}
              </div>
            <div className="box address-box">
              <div className="columns">
                <div className="column is-four-fifths">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="Enter your wallet address (0x...)"
                  defaultValue={walletAddress}
                  />
                </div>
                <div className="column">
                  <button className="button is-link is-medium" onClick={getSThandler}
                  disabled={walletAddress ? false:true}>
                    GET TOKENS
                  </button>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>{transactionData ?`transaction hash :${transactionData}` :"--"} </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
