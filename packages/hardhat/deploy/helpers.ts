import * as hre from "hardhat";

export async function verify(contractAddress: string, args: any[]) {
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("Contract verified:", contractAddress);
  } catch (e) {
    console.log("Verification error:", e);
  }
}