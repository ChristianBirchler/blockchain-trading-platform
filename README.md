# Smart-contract based derivative trading platform

This project was created in the scope of the course "Blockchains and Overlay Networks" as a Challenge Task project at 
the University of Zurich in spring semester 2021.

## Installation

### Requirements

* [Ganache](https://www.trufflesuite.com/ganache)
* [Node JS](https://nodejs.org/en/)
* [Truffle](https://www.trufflesuite.com/truffle) (run `npm install truffle -g`)

Solidity version: 0.6.0

To install the rest of the requirements, run `npm install` in the client directory.

### How to run it

1. Make sure Ganache is running locally on `127.0.0.1:7545`
2. Run `truffle compile`
3. Run `truffle migrate --reset`
4. Run `npm run start`, the client runs at `127.0.0.1:3000`


### Troubleshooting

Some issues can emerge if the gas price of the Ganache blockchain is configured to be too high. The gas price  
can be configured in the Ganache settings in the "Chain" section. 


## How to use it

To create a bet, fill out the form in the navbar section. You must provide a valid address in "Wallet", the value of the
 bet will automatically be deducted. By clicking the Submit button, the bet is created and is listed in the Open Bets 
 section. 
 
A bet can be joined by providing a valid address and clicking the join button. The value of the bet will again be 
automatically deducted from the account. Once you joined a bet, it will move to the Closed Bets section.

Once the expiration date has passed, the bet will be resolved and the winning address receives double the amount of the 
bet (both addresses have paid the amount in advance). If a bet remains open for a certain amount of time, it will 
automatically be deleted.


### Admin page:
Certain addresses can be registered as an admin account. In the admin section share prices of underlyings can be updated
 and bets can be resolved. In a future version, this would be handled automatically by using a scheduler.