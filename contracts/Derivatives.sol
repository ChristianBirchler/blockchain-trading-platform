pragma solidity >=0.6;
pragma experimental ABIEncoderV2;

contract Derivatives {
        uint public derivativeCount = 0;
        uint public shareCount = 3;
        string[] all_underlyings_test = ["General Motors", "Apple", "Bitcoin"];
        string[] all_shortages = ["GM", "AAPL", "BTC"];
        string public password1 = '{"version":3,"id":"13651754-c273-4f17-b73a-fcb23f0a90b1","address":"82fa0809a10f7c20000eca80db3fab110b1c1b6b","crypto":{"ciphertext":"61a20a6ad658d2ecd832592e5fbdaabe9c000c005ccebce345402916e8a60487","cipherparams":{"iv":"ce55a313bac3ba7b2dec70b3e565c652"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"78211f946b927376b097896563b7ca41b396c3183a6e05472a0d58990a353109","n":8192,"r":8,"p":1},"mac":"5e9b876dd1be47d1a5322b8f08dfb5516e61428b1b3b654bcbe0ca4d73eed19d"}}';
        string public password2 = '{"version":3,"id":"a8406743-46a7-4032-8967-f1b74ed14d1a","address":"43d6e6d5865d6193160d4879b400371b92ce5bc9","crypto":{"ciphertext":"71b6be87d74cbd9d507a5274d0fad9ea48df9122caea7acff36cce868334829d","cipherparams":{"iv":"06d626dcafec2f6a6abe7e821ffa4389"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"7ffd60e38c2afdab80650dfaf5507b4a69df1bbd8aa0786611c1bffce5078c09","n":8192,"r":8,"p":1},"mac":"06b2b79825d3801b7250cc990d34ebd3146e636d2aa2b9791818b14b843b3b3c"}}';
        string public password3 = '{"version":3,"id":"7252347e-c723-43a7-9761-e3cd90e90101","address":"3a4f525ef4e347536148cb9fc41f26c5062f68af","crypto":{"ciphertext":"6d84efe2eabd16d14cd78714928afed085fc7cba94e7f2a8fd3c63c4875b658e","cipherparams":{"iv":"857d0c22ce61a5c6ff5af083dd63cadf"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"78227306fa0571bcc081fb986b4aed261104897ed6ed89c7ebdfa9c7728dafb4","n":8192,"r":8,"p":1},"mac":"b6bd1280c80b69b6c715a369262c7f6c82ab675aac551c394e819155561257a9"}}';
        string public password4 = '{"version":3,"id":"81d91367-0609-4416-a834-77f7396b2734","address":"2a0ba735a610632ae10c2e9e1571c03512a72922","crypto":{"ciphertext":"1c8ae74f10c849c75ad3678760e37327fc67ccb74428e94e321be5130856a3c6","cipherparams":{"iv":"98ff8d1587fa838b32d9d9b74a562682"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"ca51d931ea36c136b68614b34f2dc4c53f86891d225dff5c2817b64da981bc44","n":8192,"r":8,"p":1},"mac":"07892bdfde305708292eb80e3604d71c95cc686c30314e233721e8b203a13aca"}}';

        enum Underlyings{ GeneralMotors, Catcoins, Bitcoin }

        struct Derivative {
            uint id;
            uint bet;
            uint activationTime;
            uint expiration;
            uint strike;
            string lower;
            string higher;
            bool open;
            uint underlying;
            uint etherAmount;
            address payable lowerAddress;
            address payable higherAddress;
        }

        struct Share {
            string name;
            uint price;
            string abbr;
        }

        event shareEvent(string msg);

        constructor() public {                  
            for (uint i=0; i < shareCount; i++){
                shares[i] = Share(all_underlyings_test[i], 200, all_shortages[i]);
            }
        } 

        mapping(uint => Share) public shares;
        mapping(uint => Derivative) public derivatives;

        function getUnderlyings() public view returns (string[] memory) {
            return all_underlyings_test;
        }

        function getPassword(uint _user) external view returns (string memory){
             if (_user == 1){
                 return password1;
             }
             if (_user == 2){
                 return password2;
             }
             if (_user == 3){
                 return password3;
             }
             if (_user == 4){
                 return password4;
             }
             else{
                 return "default password";
             }
        }

        function setPrice(uint _price, string calldata _shareName) external returns (string memory) {
            bool changedprice = false;
            for (uint i=0; i < shareCount; i++){
                if (keccak256(abi.encodePacked((shares[i].name))) == keccak256(abi.encodePacked((_shareName)))){
                    shares[i].price = _price;
                    changedprice = true;
                }
            }

            // TODO check all closed contracts whether any transaction is needed -> if needed do transaction 
            if (changedprice){
                return append("Changed price to ", uintToString(_price));
            } else {
                return "Error: Could not find the share";
            }
        }

        function getShareInfo(string calldata _shareName) external view returns(uint price, string memory abbr){
            for (uint i=0; i <= shareCount-1; i++){
                if (keccak256(abi.encodePacked((shares[i].name))) == keccak256(abi.encodePacked((_shareName)))){
                    // emit shareEvent(shares[i].price);
                    return (shares[i].price, shares[i].abbr);
                }
            } 
            return (1, "fail");  
        }

        // For enum parameters you have to input the number of the underlying enum like 1
        // example for truffle console:
        // let createBet7 = await instance.createBet(5, 50, 210, "", "0x3e77a447840FeED04CeD6e0B3995e761E2e8A227", 2, {value: web3.utils.toWei("5","ether"), from: "0x3e77a447840FeED04CeD6e0B3995e761E2e8A227"})
        function createBet(uint bet, uint expiration, uint strike, string memory lower, string memory higher, uint underlying) public payable {
        uint betInWei = bet * 1000000000000000000;
            // checks if the sent Ether is equal the bet amount
            require(
            keccak256(abi.encodePacked((msg.value))) == keccak256(abi.encodePacked((betInWei))), "Please send Ether which is equal to your bet amount"
        );
            bool open = true;
            uint activationTime = block.timestamp;
            uint expiration = activationTime + expiration;
            uint etherAmount = msg.value;
            derivatives[derivativeCount] = Derivative(derivativeCount, bet, activationTime, expiration, strike, lower, higher, open, underlying, etherAmount, payable(msg.sender), payable(msg.sender));
            derivativeCount ++;
        }

        // let participateInBet8 = await instance.participateInBet(1, "0x9aEE5f616f36074a77b9E4fEDB4b03214065F828", "", {value: web3.utils.toWei("5","ether"), from: "0x9aEE5f616f36074a77b9E4fEDB4b03214065F828"})
        function participateInBet(uint selectedDerivative, string memory lower, string memory higher) public payable {

            require(selectedDerivative <= derivativeCount && 0 <= selectedDerivative, "Bet does not exist");
            Derivative memory derivative = derivatives[selectedDerivative];
            require(derivative.open == true, "Please select an open Bet");

            uint betInWei = derivatives[selectedDerivative].bet * 1000000000000000000;
            require(
                keccak256(abi.encodePacked((msg.value))) == keccak256(abi.encodePacked((betInWei))), "Please send Ether which is equal to your bet amount"
            );

            bool open = false;
            if (keccak256(abi.encodePacked((lower))) != keccak256(abi.encodePacked(("")))) {
                // checks if the opposite side of the bet isn't empty
                require(keccak256(abi.encodePacked((derivative.higher))) != keccak256(abi.encodePacked((""))), "Please join the opposite side of a bet");
                uint etherAmount = derivative.etherAmount + msg.value;
                derivatives[selectedDerivative] = Derivative(selectedDerivative, derivative.bet, derivative.activationTime, derivative.expiration, derivative.strike, lower, derivative.higher, open, derivative.underlying, etherAmount, payable(msg.sender), derivative.higherAddress);
            }
            else if (keccak256(abi.encodePacked((higher))) != keccak256(abi.encodePacked(("")))) {
                // checks if the opposite side of the bet isn't empty
                require(keccak256(abi.encodePacked((derivative.lower))) != keccak256(abi.encodePacked((""))), "Please join the opposite side of a bet");
                uint etherAmount = derivative.etherAmount + msg.value;
                derivatives[selectedDerivative] = Derivative(selectedDerivative, derivative.bet, derivative.activationTime, derivative.expiration, derivative.strike, derivative.lower, higher, open, derivative.underlying, etherAmount, derivative.lowerAddress, payable(msg.sender));
            }
            else {
                revert("Participation in bet failed");
            }

        }

        function getOpenDerivatives() public view returns (Derivative[] memory) {
            // ugly method just to get the amount of open derivatives
            uint countOpenDerivatives = 0;
            for (uint i=0;i<derivativeCount;i++){
                if (derivatives[i].open) {
                    countOpenDerivatives++;
                }
            }
            // returns an array with all derivatives
            Derivative[] memory open_derivatives = new Derivative[](countOpenDerivatives);
            uint j = 0;
            for (uint i=0;i<derivativeCount;i++){
                if (derivatives[i].open) {
                    open_derivatives[j] = derivatives[i];
                    j++;
                }
            }
            return open_derivatives;
        }

        function getClosedDerivatives() public view returns (Derivative[] memory){
            // ugly method just to get the amount of closed derivatives
            uint countClosedDerivatives = 0;
            for (uint i=0;i<derivativeCount;i++){
                if (derivatives[i].open != true) {
                    countClosedDerivatives++;
                }
            }

            // returns an array with all closed derivatives
            Derivative[] memory closed_derivatives = new Derivative[](countClosedDerivatives);
            uint j = 0;
            for (uint i=0;i<derivativeCount;i++){
                if (derivatives[i].open != true) {
                    closed_derivatives[j] = derivatives[i];
                    j++;
                }
            }
            return closed_derivatives;
        }

// let balance = web3.eth.getBalance("0xB68C3cF1f2dA98bfD69F9a4e58e956658646F5d9")
        function checkDerivative() public {
            emit shareEvent("inside function");
            uint currentTime = block.timestamp;
            for (uint i=0; i<derivativeCount; i++){
                emit shareEvent("inside loop");
                Derivative memory derivative = derivatives[i];
                uint activeTime = currentTime - derivative.activationTime;
                if ((derivative.etherAmount > 0) && (currentTime > derivative.expiration)) {
                    emit shareEvent("inside first if");
                    if (shares[derivative.underlying].price > derivative.strike){
                        emit shareEvent("inside if");
                        address payable addr = derivative.higherAddress;
                        addr.transfer(derivative.etherAmount);
                        derivatives[i] = Derivative(i, derivative.bet, derivative.activationTime, derivative.expiration, derivative.strike, derivative.lower, derivative.higher, derivative.open, derivative.underlying, 0, derivative.lowerAddress, derivative.higherAddress);
                    }
                    else {
                        address payable addr = derivative.lowerAddress;
                        addr.transfer(derivative.etherAmount);
                        derivatives[i] = Derivative(i, derivative.bet, derivative.activationTime, derivative.expiration, derivative.strike, derivative.lower, derivative.higher, derivative.open, derivative.underlying, 0, derivative.lowerAddress, derivative.higherAddress);
                    }
                }
                // 1 day = 86400 seconds, 10 days = 864000
                // if nobody has joined the bet in 10 days the full amount is returned to the address which opened the bet
                else if ((activeTime > 864000) && (derivative.open)){
                    address payable addr = derivative.lowerAddress; // this works for either because if only one address is in the bet it is safed both in lower and higher address payable field
                    addr.transfer(derivative.etherAmount);
                    derivatives[i] = Derivative(i, derivative.bet, derivative.activationTime, derivative.expiration, derivative.strike, derivative.lower, derivative.higher, false, derivative.underlying, 0, derivative.lowerAddress, derivative.higherAddress);

                }
            }
        }

         function test() external returns(string memory){
            emit shareEvent("other function");
            for (uint i=0;i<derivativeCount;i++){
                emit shareEvent("inside loop");
                Derivative memory derivative = derivatives[i];
    
                emit shareEvent("inside if");
                address payable addr = derivative.higherAddress;
                addr.transfer(2000000000000000000);
                derivatives[i] = Derivative(i, derivative.bet, derivative.activationTime, derivative.expiration, derivative.strike, derivative.lower, derivative.higher, derivative.open, derivative.underlying, 0, derivative.lowerAddress, derivative.higherAddress);
               
            }
        }


        function append(string memory a, string memory b) internal pure returns (string memory) {
            return string(abi.encodePacked(a, b));
        }

        function uintToString(uint v) public pure returns (string memory) {
            uint maxlength = 100;
            bytes memory reversed = new bytes(maxlength);
            uint i = 0;
            while (v != 0) {
                uint remainder = v % 10;
                v = v / 10;
                reversed[i++] = bytes1(uint8(48 + remainder));
            }
            bytes memory s = new bytes(i); // i + 1 is inefficient
            for (uint j = 0; j < i; j++) {
                s[j] = reversed[i - j - 1]; // to avoid the off-by-one error
            }
            string memory str = string(s);  // memory isn't implicitly convertible to storage
            return str;
        }

//        function bytesToAddress (bytes memory b) public view returns (address) {
//            uint result = 0;
//            for (uint i = 0; i < b.length; i++) {
//                uint c = uint(b[i]);
//                if (c >= 48 && c <= 57) {
//                    result = result * 16 + (c - 48);
//                }
//                if(c >= 65 && c<= 90) {
//                    result = result * 16 + (c - 55);
//                }
//                if(c >= 97 && c<= 122) {
//                    result = result * 16 + (c - 87);
//                }
//            }
//            return address(result);
//        }

//        function bytesToAddress(bytes memory bys) private pure returns (address addr) {
//            assembly {
//                addr := mload(add(bys,20))
//            }
//        }

//        function bytesToAddress(bytes memory _address) public returns (address) {
//            uint160 m = 0;
//            uint160 b = 0;
//
//            for (uint8 i = 0; i < 20; i++) {
//                m *= 256;
//                b = uint160(_address[i]);
//                m += (b);
//            }
//
//            return address(m);
//        }

        // function testRecovery(
        //     bytes32 _msgHash,
        //     uint8 _v,
        //     bytes32 _r,
        //     bytes32 _s)
        //     public
        //     returns (bool)
        // {
        //     string memory returned = ecrecover(_msgHash, _v, _r, _s);
        //     if (returned == expected) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }
}