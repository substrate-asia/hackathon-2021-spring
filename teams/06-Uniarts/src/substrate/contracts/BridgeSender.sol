pragma solidity ^0.4.24;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        // uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return a / b;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}

contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract BridgeSender {
    address bridgeWalletAddress;

    using SafeMath for uint256;

    event Bridgesended(uint256 total, address tokenAddress, string uartsAddress);

    // constructor
    constructor(address bridge_wallet_address) public {
        bridgeWalletAddress = bridge_wallet_address;
    }

    function() public payable {}

    function sendToken(address token, uint256 _balance, string _uarts_address) public payable {
        if (token == 0x000000000000000000000000000000000000bEEF){
            sendEther(bridgeWalletAddress, _balance, _uarts_address);
        } else {
            ERC20 erc20token = ERC20(token);
            erc20token.transferFrom(msg.sender, bridgeWalletAddress, _balance);
            Bridgesended(_balance, token, _uarts_address);
        }
    }

    function sendEther(address _contributor, uint256 _balance, string _uarts_address) public payable {
        _contributor.transfer(_balance);
        Bridgesended(msg.value, 0x000000000000000000000000000000000000bEEF, _uarts_address);
    }
}