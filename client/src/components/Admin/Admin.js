import { Button, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react'
import Derivatives from "../../contracts/Derivatives.json";
import { makeStyles } from '@material-ui/core/styles';
import Web3 from "web3";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
    width: "40%",
  },
}));

const Admin = (props) => {
     const [web3, setWeb3] = useState()
     const [contractInstance, setContractInstance] = useState()
     const [underlyings, setUnderlyings] = useState([])
     const [accounts, setAccounts] = useState([])
     const [checked, setChecked] = React.useState([1]);
     const classes = useStyles();
     const history = useHistory()

     
     useEffect(() => {
         loadWeb3();
     },[])
 
     async function loadWeb3(){
         try{
             const provider = new Web3.providers.HttpProvider(
               "http://127.0.0.1:7545"
             );
             const web3_instance = new Web3(provider);
             const networkId = await web3_instance.eth.net.getId();
             const deployedNetwork = Derivatives.networks[networkId]
             const contract = new web3_instance.eth.Contract(
                 Derivatives.abi,
                 deployedNetwork && deployedNetwork.address,
               );
               

             // set important values
             const accounts = await web3_instance.eth.getAccounts()
             let i;
             const underlying = await contract.methods.getUnderlyings().call()
             const results = []

             for (i=0; i<=underlying.length-1; i++){
                  const stock = underlying[i]
                  const priceAndAbbr = await getCurrentPrice(stock, contract)
                  const abbr = priceAndAbbr['abbr']
                  let currentPriceWeb = 200
                  if(abbr !== "-"){
                    currentPriceWeb = await getCurrentPriceWeb(abbr)
                  }
                  results.push([stock, priceAndAbbr["price"], currentPriceWeb])
             }
     
             setUnderlyings(results)
             setContractInstance(contract)
             setWeb3(web3_instance)
             setAccounts(accounts)
         } 
         catch (error) {
         // Catch any errors for any of the above operations.
         alert(
           `Failed to load web3, accounts, or contract. Check console for details.`,
         );
         console.error(error);
       }
     }

     const getCurrentPriceWeb = async (firm) => {
      const firms = ["GM", "AAPL"]
      const currencies = ["BTC", "CAT1"]
      const date = new Date()
      const API_KEY = "I1SMGKJDFRYF3D41";
      const API_CALL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${firm}&outputsize=compact&apikey=${API_KEY}`
      const API_CALL_FX = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${firm}&to_currency=USD&apikey=${API_KEY}`
      let price = 400;

      if(firms.includes(firm)){
        try {
          price = await fetch(API_CALL)
          .then(
            function(response){
              return response.json()
            }
          )
          .then(
            function(data) {
              const date = new Date()
  
              for (let i=0; i<=30; i++){
                date.setDate(date.getDate() - i)
                let dateToBeTested =  date.toISOString().slice(0, 10)
  
                if(data["Time Series (Daily)"][dateToBeTested] !== undefined){
                  return  parseFloat(data["Time Series (Daily)"][dateToBeTested]["4. close"])
                }
              }
              
              return 200
    
            }
          )
        }catch{
          console.log("error occurred while fetching finance data")
        }
      } else {
        try {
          price = await fetch(API_CALL_FX)
          .then(
            function(response){
              return response.json()
            }
          )
          .then(
            function(data) {
              const date = new Date()

              const exchangeRate = data["Realtime Currency Exchange Rate"]

              return Math.round(parseFloat(exchangeRate["9. Ask Price"]),2)

    
            }
          )
        }catch{
          console.log("error occurred while fetching finance data")
        }
      }

      return price;
     }

    const setNewPriceForAll = async () => {
      let newUnderlyings = [...underlyings];
      for (let i=0; i<=underlyings.length-1; i++){
        await contractInstance.methods.setPrice(parseInt(underlyings[i][2]), underlyings[i][0]).send({ from: accounts[0] })
        let newUnderlying = [underlyings[i][0], underlyings[i][2], underlyings[i][2]]
        newUnderlyings[i] = newUnderlying;
       }
      setUnderlyings(newUnderlyings)
    }
 
     const setNewPrice = async (stock, price) => {
       if(/^\d+$/.test(price)){
        await contractInstance.methods.setPrice(price, stock).send({ from: accounts[0] });
       }
     }
 
     const getCurrentPrice = async (stock, contract) => {
       return await contract.methods.getShareInfo(stock).call()
     }

     const logout = () => {
          props.handleLogout()
          history.push("/home")
          window.location.reload();
     }

     const execute = async () => {
       try {
         await contractInstance.methods.checkDerivative().send({ from: accounts[0], gas: 3000000 });
       } catch (err) {
        console.log("Failed to execute contracts") 
       }
     }
 
     return (
         <div className="App">
              <h2>Admin Overview</h2>
             <p>{"This page shows the today's price of the underlyings"}</p>
             <List dense className={classes.root}>
                    {underlyings.map((value) => {
                    const labelId = `checkbox-list-secondary-label-${value}`;
                    return (
                         <ListItem key={value} button>
                         <ListItemText id={labelId} primary={value[0]} />
                         <ListItemIcon style={{ marginLeft: "60px"}}>
                         <TextField style={{ margin: "40px"}} variant="outlined" defaultValue={value[1]} onChange={(e) => {setNewPrice(value[0], e.target.value)}}/>
                         <TextField style={{ margin: "40px"}} variant="outlined" defaultValue={value[2] + "   USD"} disabled/>
                         </ListItemIcon>
                         </ListItem>
                    );
                    })}
               </List>
               <div>
                    <Button style={{ marginTop: "50px", marginRight: "20px"}} variant="contained" onClick={execute}>Execute Contracts</Button>
                    <Button style={{ marginTop: "50px", marginRight: "20px"}} variant="contained" onClick={() => {setNewPriceForAll()}}>Set current Price</Button>
                    {//<Button style={{ marginTop: "50px", marginRight: "20px" }} variant="contained" onClick={() => {history.push("/home")}}>Go to Home</Button>
                    }
                    <Button style={{ marginTop: "50px", marginRight: "20px"}} variant="contained" onClick={() => { window.open(
                        'https://www.youtube.com/watch?v=SkgTxQm9DWM&t=11s',
                        '_blank'
                        ) }}>Watch Cat Video</Button>
                    <Button style={{ marginTop: "50px", marginRight: "20px"}} variant="contained" onClick={logout}>Logout</Button>
               </div>
         </div>
     ) 
}

export default Admin;
