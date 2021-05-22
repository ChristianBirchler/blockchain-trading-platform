import React, { useEffect, useState } from "react";
import "./App.css";
import { Button } from "@material-ui/core";
import getWeb3 from "../../getWeb3";
import Closed from '../Closed/Closed';
import Open from '../Open/Open';
import Navbar from '../Navbar/Navbar';
import Input from '../Admin/Input';
import Popup from '../Admin/Popup';
import Derivatives from "../../contracts/Derivatives.json";
import { useHistory } from "react-router-dom";


const Home = (props) => {
  const [open, setOpen] = useState(false);
  const [web3, setWeb3] = useState()
  const [contractInstance, setContractInstance] = useState()
  const [accounts, setAccounts] = useState([])
  const [alert, setAlert] = useState(false)
  const history = useHistory()
  const [underlyings, setUnderlyings] = useState([]);

  useEffect(() => {
    loadWeb3();
    getUnderlyings();
  },[JSON.stringify(contractInstance)])

  async function loadWeb3() {
      try{
          const web3_instance = await getWeb3();
          const networkId = await web3_instance.eth.net.getId();
          const deployedNetwork = Derivatives.networks[networkId]
          setContractInstance(new web3_instance.eth.Contract(
              Derivatives.abi,
              deployedNetwork && deployedNetwork.address,
            ));
          setWeb3(web3_instance)
          setAccounts(await web3_instance.eth.getAccounts())
      } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  async function getUnderlyings() {
      if (contractInstance) {
          setUnderlyings(await contractInstance.methods.getUnderlyings().call())
      }
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleLogin = async (value, user) => {
    if (user == 0){
      setAlert(true)
      return
    }
    try {
    const password = await contractInstance.methods.getPassword(user).call()
    const clearPassword = JSON.parse(password)
    const encryptedPassword = web3.eth.accounts.decrypt(clearPassword, "test");
    if(encryptedPassword.privateKey === '0x' + value){
      handleClose()
      props.login()
      history.push("/admin")
    }else {
      setAlert(true)
    }} catch{
      setAlert(true)
    }
  }

  const handleClose = () => {
    setOpen(false);
    setAlert(false)
  };

  
  return (
    <div className="App">
      <Navbar openPopUp={handleClickOpen} auth={props.auth} underlyings={underlyings}/>
      <Open underlyings={underlyings}/>
      <Closed underlyings={underlyings}/>
      <Popup open={open} handleClose={handleClose} handleLogin={handleLogin} alert={alert}/>
    </div>
  );
  
}

export default Home;

