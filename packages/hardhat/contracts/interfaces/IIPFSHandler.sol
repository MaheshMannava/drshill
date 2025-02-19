// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IIPFSHandler {
    function storeImage(string calldata imageHash) external returns (bool);
    function isValidImageFormat(string calldata imageHash) external pure returns (bool);
}