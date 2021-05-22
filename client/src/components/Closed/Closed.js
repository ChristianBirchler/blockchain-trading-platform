import React, {useEffect, useState} from 'react'
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box";
import {Table} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import getWeb3 from "../../getWeb3";
import Derivatives from "../../contracts/Derivatives.json";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({

}));

const Closed = (props) => {

    const [web3, setWeb3] = useState()
    const [contractInstance, setContractInstance] = useState()
    const [accounts, setAccounts] = useState([])
    const [closedBets, setClosedBets] = useState([])

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

        return {
            "id": bet.id,
            "bet": bet.bet,
            "expirationDate": new Date(bet.expiration * 1000).toLocaleString(),     // format date
            "underlying": props.underlyings[bet.underlying],
            "strike": bet.strike,
            "participators": [bet.lower, bet.higher]
        }
    }



    const getClosedContracts = async () => {
        // calls the getClosedDerivatives() function in the smart contract. Updates the state openBets

        if (contractInstance !== undefined) {
            let rawBets = await contractInstance.methods.getClosedDerivatives().call();

            setClosedBets(rawBets.map((rawBet) => (
                formatBet(rawBet)
            )));
        }
    };

    // get closed bets
    getClosedContracts();

    const closedContracts = closedBets.map((Contract) => (
        <TableRow>
            <TableCell>{Contract.bet} ETH</TableCell>
            <TableCell>{Contract.expirationDate}</TableCell>
            <TableCell>{Contract.underlying}</TableCell>
            <TableCell>{Contract.strike} $</TableCell>
            <TableCell>
                <p>lower: {Contract.participators[0]}</p>
                <p>higher: {Contract.participators[1]}</p>
                </TableCell>
        </TableRow>
    ));

    return (
        <Box m={20}>
            <h3>Closed Bets</h3>
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
                            Participating Addresses
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {closedBets.length > 0 ? closedContracts :
                        <p>There are no closed bets at the moment...</p>}
                </TableBody>
            </Table>
        </Box>
    )
}

export default Closed;