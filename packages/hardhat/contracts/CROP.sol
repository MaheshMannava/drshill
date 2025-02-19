// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IIPFSHandler.sol";
import "./CROPToken.sol";
import "./MemeToken.sol";

contract CROP is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for CROPToken;
    using SafeERC20 for MemeToken;

    struct Meme {
        string name;
        string imageHash;
        string description;
        address creator;
        int256 score;
        uint256 timestamp;
        mapping(address => int8) userVotes; // 1 for up, -1 for down, 0 for none
        address[] upvoters;
    }

    struct Event {
        bytes32 eventId;
        string name;
        string qrCodeHash;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 memeCount;
        address winningToken;
        mapping(uint256 => Meme) memes;
    }

    CROPToken public immutable cropToken;
    IIPFSHandler public immutable ipfsHandler;
    mapping(bytes32 => Event) public events;
    
    uint256 public constant SUBMISSION_FEE = 60 * 10**18;
    uint256 public constant VOTE_FEE = 1 * 10**18;

    event EventCreated(bytes32 indexed eventId, string name, uint256 startTime, uint256 endTime);
    event MemeSubmitted(bytes32 indexed eventId, uint256 indexed memeId, address creator, string name);
    event VoteCast(bytes32 indexed eventId, uint256 indexed memeId, address voter, int256 newScore);
    event EventEnded(bytes32 indexed eventId, address winningToken, uint256 winningMemeId);
    event PausedStateChanged(bool paused);

    bool public paused;
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    constructor(address _cropToken, address _ipfsHandler) {
        cropToken = CROPToken(_cropToken);
        ipfsHandler = IIPFSHandler(_ipfsHandler);
    }

    function createEvent(string calldata name, uint256 duration) external onlyOwner returns (bytes32) {
        require(duration >= 1 hours && duration <= 30 days, "Invalid duration");
        bytes32 eventId = keccak256(abi.encodePacked(name, block.timestamp));
        string memory qrCodeHash = string(abi.encodePacked("QR_", eventId));
        
        Event storage newEvent = events[eventId];
        newEvent.eventId = eventId;
        newEvent.name = name;
        newEvent.qrCodeHash = qrCodeHash;
        newEvent.startTime = block.timestamp;
        newEvent.endTime = block.timestamp + duration;
        newEvent.active = true;

        emit EventCreated(eventId, name, block.timestamp, block.timestamp + duration);
        return eventId;
    }

    function submitMeme(
        bytes32 eventId,
        string calldata name,
        string calldata imageHash,
        string calldata description
    ) external nonReentrant whenNotPaused {
        require(ipfsHandler.isValidImageFormat(imageHash), "Invalid image format");
        require(ipfsHandler.storeImage(imageHash), "IPFS storage failed");
        
        require(bytes(name).length <= 100, "Name too long");
        require(bytes(description).length <= 1000, "Description too long");
        
        Event storage evt = events[eventId];
        require(evt.active, "Event not active");
        require(block.timestamp >= evt.startTime && block.timestamp <= evt.endTime, "Not in submission period");
        
        cropToken.safeTransferFrom(msg.sender, address(this), SUBMISSION_FEE);

        uint256 memeId = evt.memeCount++;
        Meme storage meme = evt.memes[memeId];
        meme.name = name;
        meme.imageHash = imageHash;
        meme.description = description;
        meme.creator = msg.sender;
        meme.timestamp = block.timestamp;
        meme.score = 0;

        emit MemeSubmitted(eventId, memeId, msg.sender, name);
    }

    function vote(bytes32 eventId, uint256 memeId, bool isUpvote) external nonReentrant whenNotPaused {
        Event storage evt = events[eventId];
        require(evt.active, "Event not active");
        require(block.timestamp >= evt.startTime && block.timestamp <= evt.endTime, "Not in voting period");
        require(memeId < evt.memeCount, "Invalid meme");

        Meme storage meme = evt.memes[memeId];
        require(meme.userVotes[msg.sender] == 0, "Already voted");
        
        cropToken.safeTransferFrom(msg.sender, address(this), VOTE_FEE);

        int8 voteValue = isUpvote ? int8(1) : int8(-1);
        meme.score += voteValue;
        meme.userVotes[msg.sender] = voteValue;
        
        if(isUpvote) {
            meme.upvoters.push(msg.sender);
        }

        emit VoteCast(eventId, memeId, msg.sender, meme.score);
    }

    function endEvent(bytes32 eventId) external nonReentrant onlyOwner {
        Event storage evt = events[eventId];
        require(evt.active, "Event not active");
        require(block.timestamp > evt.endTime, "Event still active");
        
        uint256 winningId;
        int256 highestScore = type(int256).min;

        for(uint256 i = 0; i < evt.memeCount; i++) {
            if(evt.memes[i].score > highestScore) {
                highestScore = evt.memes[i].score;
                winningId = i;
            }
        }

        require(highestScore > 0, "No winning meme found");

        Meme storage winner = evt.memes[winningId];
        
        MemeToken newToken = new MemeToken(winner.name, winner.name);
        evt.winningToken = address(newToken);
        
        uint256 total = 100_000 * 10**18;
        uint256 creatorShare = total * 30 / 100;
        uint256 voterShare = total - creatorShare;
        
        newToken.safeTransfer(winner.creator, creatorShare);
        
        if(winner.upvoters.length > 0) {
            uint256 voteShare = voterShare / winner.upvoters.length;
            for(uint256 i = 0; i < winner.upvoters.length; i++) {
                newToken.safeTransfer(winner.upvoters[i], voteShare);
            }
        }

        evt.active = false;
        emit EventEnded(eventId, address(newToken), winningId);
    }

    function getEventInfo(bytes32 eventId) external view returns (
        string memory name,
        string memory qrCodeHash,
        uint256 startTime,
        uint256 endTime,
        bool active,
        uint256 memeCount,
        address winningToken
    ) {
        Event storage evt = events[eventId];
        return (
            evt.name,
            evt.qrCodeHash,
            evt.startTime,
            evt.endTime,
            evt.active,
            evt.memeCount,
            evt.winningToken
        );
    }

    function getMeme(bytes32 eventId, uint256 memeId) external view returns (
        string memory name,
        string memory imageHash,
        string memory description,
        address creator,
        int256 score,
        uint256 timestamp
    ) {
        Event storage evt = events[eventId];
        require(memeId < evt.memeCount, "Invalid meme");
        Meme storage meme = evt.memes[memeId];
        return (
            meme.name,
            meme.imageHash,
            meme.description,
            meme.creator,
            meme.score,
            meme.timestamp
        );
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedStateChanged(_paused);
    }

    function recoverTokens(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to recover");
        IERC20(token).safeTransfer(owner(), balance);
    }
}