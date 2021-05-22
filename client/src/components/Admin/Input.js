import { Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react'
import Derivatives from "../../contracts/Derivatives.json";
import { makeStyles } from '@material-ui/core/styles';
import Web3 from "web3";
import getWeb3 from '../../getWeb3';

const useStyles = makeStyles(() => ({

}));


const Input = (props) => {
    const [underlyings, setUnderlyings] = useState([])
    const classes = useStyles();

  


    const runExample = async () => {
        console.log(await props.contractInstance.methods.getUnderlyings().call())
    };

    const setNewPrice = async () => {
      await props.contractInstance.methods.setPrice(250, "General Motors").send({ from: props.accounts[0] });
    }

    const getCurrentPrice = async () => {
      const x = await props.contractInstance.methods.getShareInfo("General Motors").call()
      console.log(x)
    }

    return (
        <div>
            <Button variant="contained" color="primary" onClick={runExample}>Get all Underylings</Button>
            <Button variant="contained" color="primary" onClick={getCurrentPrice}>Get current Price of Share GM</Button>
            <Button variant="contained" color="primary" onClick={setNewPrice}>Set price of GM</Button>
            <p>This the input component {underlyings}</p>
        </div>
    )
}

export default Input;
