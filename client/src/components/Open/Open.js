import React, { useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {Table} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box"
import getWeb3 from "../../getWeb3";
import Derivatives from "../../contracts/Derivatives";


const useStyles = makeStyles(() => ({

}));


const Open = (props) => {

    const [web3, setWeb3] = useState();
    const [contractInstance, setContractInstance] = useState();
    const [accounts, setAccounts] = useState([]);
    const [openBets, setOpenBets] = useState([]);
    const [textFieldInput, setTextFieldInput] = useState('');

    useEffect(() => {
        loadWeb3();
    },[])

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

    function formatBet(bet) {
        // formats the bet for nice displaying (mainly the timestamp, underlying and higher or lower)

        // higher or lower
        let adversaryBet = "";
        if (bet.higher === "") {
            adversaryBet = "lower"
        } else {
            adversaryBet = "higher"
        }

        return {
            "id": bet.id,
            "bet": bet.bet,
            "expirationDate": new Date(bet.expiration * 1000).toLocaleString(),     // format date
            "underlying": props.underlyings[bet.underlying],
            "strike": bet.strike,
            "adversaryBet": adversaryBet
        }
    }

    const getOpenContracts = async () => {
        // calls the getOpenDerivatives() function in the smart contract. Updates the state openBets

        if (contractInstance !== undefined) {
            let rawBets = await contractInstance.methods.getOpenDerivatives().call();
            setOpenBets(rawBets.map((rawBet) => (
                formatBet(rawBet)
            )));
        }
    };

    async function handleJoin(index, address, higher, bet) {
        // calls the participateInBet function in the smart contract with the index of the respective bet.

        let higherAddress = '';
        let lowerAddress = '';

        if (higher === "higher") {
            lowerAddress = address
        } else {
            higherAddress = address
        }

        if (contractInstance !== undefined){
            await contractInstance.methods.participateInBet(index, lowerAddress, higherAddress).send({value: web3.utils.toWei(bet,"ether"), from: address, gas: 3000000})
        }
    }

    // get open bets
    getOpenContracts();

    const openContracts = openBets.map((Contract, index) => (
        <TableRow>
            <TableCell>{Contract.bet} ETH</TableCell>
            <TableCell>{Contract.expirationDate}</TableCell>
            <TableCell>{Contract.underlying}</TableCell>
            <TableCell>{Contract.strike} $</TableCell>
            <TableCell>{Contract.adversaryBet}</TableCell>
            <TableCell>
                <TextField
                    id={index}
                    onChange={(event) => {setTextFieldInput(event.target.value)}}
                    label={'Enter Your Address'}
                    variant={'filled'}
                    size={'small'}/>
                <Button
                    size={'large'}
                    onClick={() => handleJoin(Contract.id, textFieldInput, Contract.adversaryBet, Contract.bet)}
                >Join</Button>
            </TableCell>
        </TableRow>
    ));

    return (
        <Box m={20}>
            <h3>Open Bets</h3>
            <Table className={Table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Bet
                        </TableCell>
                        <TableCell>
                            Expiration Date
                        </TableCell>
                        <TableCell>
                            Underlying
                        </TableCell>
                        <TableCell>
                            Strike
                        </TableCell>
                        <TableCell>
                            Adversary Bet
                        </TableCell>
                        <TableCell>
                            Join
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {openBets.length > 0 ? openContracts :
                        <p>There are no open bets at the moment...</p>}
                </TableBody>
            </Table>
        </Box>
    )
};

export default Open;