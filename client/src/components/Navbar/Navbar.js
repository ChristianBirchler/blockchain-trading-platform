import React, { Component } from 'react'
import {Button, Input, Select, Table} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box"
//import Button from "@material-ui/core/Button"
import { withRouter } from 'react-router-dom';
import getWeb3 from '../../getWeb3'
import Derivatives from "../../contracts/Derivatives";


class Navbar extends Component {

    constructor(props){
        super(props);
        this.state = {
            decision: null,
            bet: null,
            strike: null,
            underlying: null,
            wallet: "",
            expiration: null
        };

        

    }

    async componentDidMount(){
        try{
            this.web3_instance = await getWeb3();
            this.networkId = await this.web3_instance.eth.net.getId();
            this.deployedNetwork = Derivatives.networks[this.networkId]
            this.contractInstance = new this.web3_instance.eth.Contract(
                Derivatives.abi,
                this.deployedNetwork && this.deployedNetwork.address,
              );
            //setWeb3(web3_instance)
            //setAccounts(await web3_instance.eth.getAccounts())
            this.accounts = this.web3_instance.eth.getAccounts();

            this.underlyings = await this.contractInstance.methods.getUnderlyings().call();

        } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.underlyings = this.props.underlyings;
    }

    async submit(){
        let decision = this.state.decision;
        let bet = this.state.bet;
        let strike = this.state.strike;
        let underlying_index = this.underlyings.indexOf(this.state.underlying);
        let wallet = this.state.wallet;
        let expiration = this.state.expiration;


        // call createBet function of the contract createBet(uint bet, uint expiration, uint strike, string memory lower, string memory higher, Underlyings underlying)
        
        if(decision == "lower"){
            await this.contractInstance.methods.createBet(
                bet,
                expiration,
                strike,
                wallet,
                "",
                underlying_index)
                .send({value: this.web3_instance.utils.toWei(bet,"ether"), from: wallet, gas: 3000000})
        }else if(decision == "higher"){
            await this.contractInstance.methods.createBet(
                bet,
                expiration,
                strike,
                "",
                wallet,
                underlying_index)
                .send({value: this.web3_instance.utils.toWei(bet,"ether"), from: wallet, gas: 3000000})
        }else{
            alert("Could not create the bet!")
        }

        this.setState({
            wallet: "",
        })
    }

    handleDecision(event){
        let value = event.target.value;

        this.setState({
            decision: value
        });
    }

    handleWallet(event){
        let value = event.target.value;

        this.setState({
            wallet: value
        });
    }

    handleBet(event){
        let value = event.target.value;

        this.setState({
            bet: value
        });
    }

    handleStrike(event){
        let value = event.target.value;

        this.setState({
            strike: value
        });
    }

    handleUnderlying(event){
        let value = event.target.value;

        this.setState({
            underlying: value
        });
    }

    handleExpiration(event){
        let value = event.target.value;

        this.setState({
            expiration: value
        });
    }

    printOptions(){
        if(this.underlyings){
            return(
                //<option value="catcoins">Catcoins</option>
                this.underlyings.map((item, key) => {
                    return(
                        <option value={item}>{item}</option>
                    )
                })
            );
        }
    }

    render(){
        return(
            <div className="Navbar">
                <Box m={20}>
                    <h3>Navbar</h3>
                    <Table className={Table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Higher/Lower
                                </TableCell>
                                <TableCell>
                                    Wallet
                                </TableCell>
                                <TableCell>
                                    Value Bet in ETH
                                </TableCell>
                                <TableCell>
                                    Strike USD
                                </TableCell>
                                <TableCell>
                                    Expiration in Seconds
                                </TableCell>
                                <TableCell>
                                    Underlying
                                </TableCell>
                                <Button style={{ marginLeft: "100px"}} variant="contained" onClick={() => {this.props.auth ? this.props.history.push("/admin") : this.props.openPopUp()}} >Admin Login</Button>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Select onChange={this.handleDecision.bind(this)}>
                                        <option value="lower">Lower</option>
                                        <option value="higher" selected>Higher</option>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input type="text" value={this.state.wallet} onChange={this.handleWallet.bind(this)}></Input>
                                </TableCell>
                                <TableCell>
                                    <Input type="number" onChange={this.handleBet.bind(this)}></Input>
                                </TableCell>
                                <TableCell>
                                    <Input type="number" onChange={this.handleStrike.bind(this)}></Input>
                                </TableCell>
                                <TableCell>
                                    <Input type="number" onChange={this.handleExpiration.bind(this)}></Input>
                                </TableCell>
                                <TableCell>
                                    <Select onChange={this.handleUnderlying.bind(this)}>
                                        {this.printOptions()}
                                    </Select>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="Submit" style={{marginTop: "35px"}}><Button variant="contained" onClick={this.submit.bind(this)}>Submit</Button></div>
                </Box>
            </div>
        )
    }
}

// const navbar = () => {
//     return <p>This component displays the navbar</p>
// }

export default withRouter(Navbar);
