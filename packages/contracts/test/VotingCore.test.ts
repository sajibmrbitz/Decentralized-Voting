import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingCore } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("VotingCore", function () {
    let votingCore: VotingCore;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const VotingCoreFactory = await ethers.getContractFactory("VotingCore");
        votingCore = await VotingCoreFactory.deploy() as VotingCore;
    });

    const getLatestBlockTimestamp = async () => {
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        return blockBefore?.timestamp ?? 0;
    };

    describe("Election Creation", function () {
        it("Should create an election successfully", async function () {
            const timestamp = await getLatestBlockTimestamp();
            const startTime = timestamp + 60;
            const endTime = startTime + 3600;
            await votingCore.createElection("Test Election", "Description", startTime, endTime, "hash");

            const election = await votingCore.getElection(1);
            expect(election.title).to.equal("Test Election");
            expect(election.isActive).to.equal(true);
        });

        it("Should fail if start time is after end time", async function () {
            const timestamp = await getLatestBlockTimestamp();
            const startTime = timestamp + 3600;
            const endTime = startTime - 60;
            await expect(
                votingCore.createElection("Test", "Desc", startTime, endTime, "hash")
            ).to.be.revertedWith("Start time must be before end time");
        });
    });

    describe("Candidate Management", function () {
        beforeEach(async function () {
            const timestamp = await getLatestBlockTimestamp();
            const startTime = timestamp + 60;
            const endTime = startTime + 3600;
            await votingCore.createElection("Test Election", "Description", startTime, endTime, "hash");
        });

        it("Should add a candidate successfully", async function () {
            await votingCore.addCandidate(1, "Candidate 1", "imageHash");
            const results = await votingCore.getResults(1);
            expect(results.names[0]).to.equal("Candidate 1");
        });

        it("Should only allow owner to add candidate", async function () {
            await expect(
                votingCore.connect(addr1).addCandidate(1, "Candidate 1", "imageHash")
            ).to.be.revertedWithCustomError(votingCore, "OwnableUnauthorizedAccount");
        });
    });

    describe("Voting", function () {
        let startTime: number;
        let endTime: number;

        beforeEach(async function () {
            const timestamp = await getLatestBlockTimestamp();
            startTime = timestamp + 10;
            endTime = startTime + 3600;
            await votingCore.createElection("Test Election", "Description", startTime, endTime, "hash");
            await votingCore.addCandidate(1, "Candidate 1", "imageHash");
            await votingCore.addCandidate(1, "Candidate 2", "imageHash");
        });

        it("Should cast a vote successfully", async function () {
            await ethers.provider.send("evm_increaseTime", [100]);
            await ethers.provider.send("evm_mine", []);

            await votingCore.connect(addr1).castVote(1, 1);
            const results = await votingCore.getResults(1);
            expect(results.voteCounts[0]).to.equal(1);
            expect(await votingCore.isEligibleToVote(1, addr1.address)).to.equal(false);
        });

        it("Should prevent double voting", async function () {
            await ethers.provider.send("evm_increaseTime", [100]);
            await ethers.provider.send("evm_mine", []);

            await votingCore.connect(addr1).castVote(1, 1);
            await expect(
                votingCore.connect(addr1).castVote(1, 2)
            ).to.be.revertedWith("Already voted in this election");
        });

        it("Should fail if election has not started", async function () {
            await expect(
                votingCore.connect(addr1).castVote(1, 1)
            ).to.be.revertedWith("Election has not started");
        });

        it("Should fail if election has ended", async function () {
            await ethers.provider.send("evm_increaseTime", [4000]);
            await ethers.provider.send("evm_mine", []);

            await expect(
                votingCore.connect(addr1).castVote(1, 1)
            ).to.be.revertedWith("Election has ended");
        });
    });
});
