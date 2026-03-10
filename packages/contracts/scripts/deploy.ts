import { ethers } from "hardhat";

async function main() {
    console.log("Deploying VotingCore...");

    const votingCore = await ethers.deployContract("VotingCore");

    await votingCore.waitForDeployment();

    console.log(`VotingCore deployed to: ${await votingCore.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
