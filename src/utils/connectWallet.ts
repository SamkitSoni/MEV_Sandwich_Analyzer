// utils/connectWallet.ts
import { ethers } from "ethers";

export const connectWallet = async () => {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask!");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum); // Ethers v6+
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  } catch (error) {
    console.error("Wallet connection error:", error);
    return null;
  }
};
