// contracts/IPFSHandler.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/IIPFSHandler.sol";

contract IPFSHandler is IIPFSHandler {
    // Event to track image storage
    event ImageStored(string imageHash, address submitter);
    
    // Mapping to track stored hashes
    mapping(string => bool) private storedHashes;

    function storeImage(string calldata imageHash) external returns (bool) {
        require(isValidImageFormat(imageHash), "Invalid image hash format");
        require(!storedHashes[imageHash], "Hash already stored");
        
        storedHashes[imageHash] = true;
        emit ImageStored(imageHash, msg.sender);
        return true;
    }

    function isValidImageFormat(string calldata imageHash) public pure returns (bool) {
        bytes memory hashBytes = bytes(imageHash);
        
        // Length validation
        require(hashBytes.length > 0, "Empty hash");
        require(hashBytes.length == 46, "Invalid IPFS hash length"); // CIDv0 is 46 characters
        
        // Prefix validation for CIDv0
        require(hashBytes[0] == 'Q' && hashBytes[1] == 'm', "Invalid IPFS hash prefix");
        
        // Character set validation
        for(uint i = 0; i < hashBytes.length; i++) {
            bytes1 char = hashBytes[i];
            require(
                (char >= '0' && char <= '9') ||
                (char >= 'a' && char <= 'z') ||
                (char >= 'A' && char <= 'Z') ||
                char == '-' || char == '_',
                "Invalid character in hash"
            );
        }
        
        return true;
    }
}