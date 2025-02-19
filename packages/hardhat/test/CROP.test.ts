// test/CROP.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { 
  CROP,
  CROPToken,
  IPFSHandler,
  MemeToken 
} from "../typechain-types";

describe("CROP", function () {
  let crop: CROP;
  let cropToken: CROPToken;
  let ipfsHandler: IPFSHandler;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let eventId: string;

  const EVENT_NAME = "CropCircle Event #1";
  const EVENT_DURATION = 3600; // 1 hour
  const MEME_NAME = "DOGE";
  const MEME_IMAGE = "QmT7fqVKPSkhxc8hg8NLEV8Qx1ZXBsVKDXJpq8VwE6HZpW"; // 46 characters
  const MEME_DESCRIPTION = "Much wow";
  const SUBMISSION_FEE = ethers.parseEther("60");
  const VOTE_FEE = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy CROPToken
    const CROPToken = await ethers.getContractFactory("CROPToken");
    cropToken = await CROPToken.deploy();

    // Deploy IPFSHandler
    const IPFSHandler = await ethers.getContractFactory("IPFSHandler");
    ipfsHandler = await IPFSHandler.deploy();

    // Deploy CROP
    const CROP = await ethers.getContractFactory("CROP");
    crop = await CROP.deploy(
      await cropToken.getAddress(),
      await ipfsHandler.getAddress()
    );

    // Setup initial tokens (100 SCROP tokens as per spec)
    await cropToken.connect(user1).autoDistribute();
    await cropToken.connect(user2).autoDistribute();
    await cropToken.connect(user1).approve(await crop.getAddress(), ethers.parseEther("100"));
    await cropToken.connect(user2).approve(await crop.getAddress(), ethers.parseEther("100"));

    // Create event
    const tx = await crop.connect(owner).createEvent(EVENT_NAME, EVENT_DURATION);
    const receipt = await tx.wait();
    eventId = receipt?.logs[0].topics[1] as string;
  });

  describe("Event Creation", function () {
    it("Should create event with correct parameters", async function () {
      const eventInfo = await crop.getEventInfo(eventId);
      expect(eventInfo.name).to.equal(EVENT_NAME);
      expect(eventInfo.active).to.be.true;
    });

    it("Should only allow owner to create event", async function () {
      await expect(
        crop.connect(user1).createEvent(EVENT_NAME, EVENT_DURATION)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Meme Submission", function () {
    it("Should submit meme and deduct 60 SCROP tokens", async function () {
      const balanceBefore = await cropToken.balanceOf(user1.address);
      
      await crop.connect(user1).submitMeme(eventId, MEME_NAME, MEME_IMAGE, MEME_DESCRIPTION);
      
      const balanceAfter = await cropToken.balanceOf(user1.address);
      expect(balanceAfter).to.equal(balanceBefore - SUBMISSION_FEE);

      const meme = await crop.getMeme(eventId, 0);
      expect(meme[0]).to.equal(MEME_NAME);
      expect(meme[4]).to.equal(0); // initial score
    });

    it("Should fail if submission fee not approved", async function () {
      await cropToken.connect(user1).approve(await crop.getAddress(), 0);
      await expect(
        crop.connect(user1).submitMeme(eventId, MEME_NAME, MEME_IMAGE, MEME_DESCRIPTION)
      ).to.be.reverted;
    });
  });

  describe("Voting System", function () {
    beforeEach(async function () {
      await crop.connect(user1).submitMeme(eventId, MEME_NAME, MEME_IMAGE, MEME_DESCRIPTION);
    });

    it("Should calculate score correctly (upvotes - downvotes)", async function () {
      // User2 upvotes
      await crop.connect(user2).vote(eventId, 0, true);
      let meme = await crop.getMeme(eventId, 0);
      expect(meme[4]).to.equal(1); // score should be 1

      // Another user downvotes
      await cropToken.connect(owner).autoDistribute();
      await cropToken.connect(owner).approve(await crop.getAddress(), ethers.parseEther("100"));
      await crop.connect(owner).vote(eventId, 0, false);
      
      meme = await crop.getMeme(eventId, 0);
      expect(meme[4]).to.equal(0); // score should be 0 (1 up - 1 down)
    });

    it("Should deduct 1 SCROP token per vote", async function () {
      const balanceBefore = await cropToken.balanceOf(user2.address);
      await crop.connect(user2).vote(eventId, 0, true);
      const balanceAfter = await cropToken.balanceOf(user2.address);
      expect(balanceAfter).to.equal(balanceBefore - VOTE_FEE);
    });

    it("Should prevent double voting", async function () {
      await crop.connect(user2).vote(eventId, 0, true);
      await expect(
        crop.connect(user2).vote(eventId, 0, false)
      ).to.be.revertedWith("Already voted");
    });
  });

  describe("Token Distribution", function () {
    beforeEach(async function () {
      await crop.connect(user1).submitMeme(eventId, MEME_NAME, MEME_IMAGE, MEME_DESCRIPTION);
      await crop.connect(user2).vote(eventId, 0, true);
      await time.increase(EVENT_DURATION + 1);
    });

    it("Should distribute tokens correctly (30/70 split)", async function () {
      await crop.connect(owner).endEvent(eventId);
      
      const eventInfo = await crop.getEventInfo(eventId);
      
      // Get winning token address directly without destructuring
      const winningToken = eventInfo.winningToken; // or eventInfo[6] if it's an array
      expect(eventInfo.active).to.be.false; // or eventInfo[3] if it's an array
      
      const memeToken = await ethers.getContractAt("MemeToken", winningToken);
      
      // Check creator share (30%)
      const creatorBalance = await memeToken.balanceOf(user1.address);
      expect(creatorBalance).to.equal(ethers.parseEther("30000")); // 30% of 100k

      // Check voter share (70%)
      const voterBalance = await memeToken.balanceOf(user2.address);
      expect(voterBalance).to.equal(ethers.parseEther("70000")); // 70% of 100k
    });

    it("Should only allow owner to end event", async function () {
      await expect(
        crop.connect(user1).endEvent(eventId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail if event is still active", async function () {
      // Create a new event specifically for this test
      const newEventTx = await crop.connect(owner).createEvent("New Test Event", EVENT_DURATION);
      const newEventReceipt = await newEventTx.wait();
      const newEventId = newEventReceipt?.logs[0].topics[1] as string;

      await expect(
        crop.connect(owner).endEvent(newEventId)
      ).to.be.revertedWith("Event still active");
    });
  });

  describe("IPFS Integration", function () {
    it("Should validate IPFS hash format", async function () {
      // Invalid hash
      await expect(
        crop.connect(user1).submitMeme(eventId, MEME_NAME, "invalid_hash", MEME_DESCRIPTION)
      ).to.be.revertedWith("Invalid IPFS hash length");

      // Valid hash but wrong prefix
      await expect(
        crop.connect(user1).submitMeme(eventId, MEME_NAME, "ba" + MEME_IMAGE.slice(2), MEME_DESCRIPTION)
      ).to.be.revertedWith("Invalid IPFS hash prefix");
    });
  });

  describe("Input Validation", function () {
    it("Should validate event duration", async function () {
      await expect(
        crop.connect(owner).createEvent(EVENT_NAME, 59 * 60) // Less than 1 hour
      ).to.be.revertedWith("Invalid duration");

      await expect(
        crop.connect(owner).createEvent(EVENT_NAME, 31 * 24 * 60 * 60) // More than 30 days
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should validate meme name and description length", async function () {
      const longName = "a".repeat(101);
      const longDesc = "a".repeat(1001);

      await expect(
        crop.connect(user1).submitMeme(eventId, longName, MEME_IMAGE, MEME_DESCRIPTION)
      ).to.be.revertedWith("Name too long");

      await expect(
        crop.connect(user1).submitMeme(eventId, MEME_NAME, MEME_IMAGE, longDesc)
      ).to.be.revertedWith("Description too long");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause/unpause", async function () {
      await crop.connect(owner).setPaused(true);
      
      await expect(
        crop.connect(user1).submitMeme(eventId, MEME_NAME, MEME_IMAGE, MEME_DESCRIPTION)
      ).to.be.revertedWith("Contract is paused");

      await crop.connect(owner).setPaused(false);
      
      // Should work after unpausing
      await crop.connect(user1).submitMeme(eventId, MEME_NAME, MEME_IMAGE, MEME_DESCRIPTION);
    });

    it("Should allow token recovery", async function () {
      const amount = ethers.parseEther("10");
      await cropToken.connect(user1).transfer(crop.getAddress(), amount);
      
      const balanceBefore = await cropToken.balanceOf(owner.address);
      await crop.connect(owner).recoverTokens(cropToken.getAddress());
      const balanceAfter = await cropToken.balanceOf(owner.address);
      
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });
  });
});