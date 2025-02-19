// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CROPToken is ERC20, Ownable {
    uint256 public constant INITIAL_TOKENS = 100 * 10**18;
    mapping(address => bool) public hasReceived;

    constructor() ERC20("CROP Token", "CROP") {}

    function autoDistribute() external {
        require(!hasReceived[msg.sender], "Already received tokens");
        hasReceived[msg.sender] = true;
        _mint(msg.sender, INITIAL_TOKENS);
    }
}