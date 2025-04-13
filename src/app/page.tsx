"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { connectWallet } from "../utils/connectWallet"; // adjust the path if needed

// Extend the Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LandingPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleWalletConnection = async () => {
    try {
      const wallet = await connectWallet();

      if (!wallet) {
        setErrorMessage("Failed to connect wallet. Please try again.");
        return;
      }

      const { address, signer } = wallet;
      setWalletAddress(address);
      setIsConnected(true);
      setErrorMessage("");

      // Sign a message
      const message = `Sign up for MEV Analyzer with wallet: ${address}`;
      const signature = await signer.signMessage(message);

      // Store wallet in DB (backend should handle deduplication)
      const response = await fetch("/api/store-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, signature }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sign up.");

      alert(data.message);

      await fetch("/api/sandwitch-csv")
      .then(res => res.json())
      .then(data => {
        console.log("CSV generation:", data.message || data);
      })
      .catch(err => {
        console.error("Error calling sandwichCSV API:", err);
      });

      // Redirect or next step
      router.push("/graph");

    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to connect/sign up. Please try again."
      );
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-amber-500 flex flex-col items-center justify-center p-6">
      <h1 className="text-9xl font-bold text-center mb-5 text-black" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>MEV Analyzer</h1>
      <p className="text-2xl text-center mb-5 text-gray-700" style={{ fontFamily: '"Shadows Into Light", sans-serif' }}>
        Connect your wallet to access the MEV dashboard.
      </p>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {errorMessage}
        </div>
      )}

      {!isConnected ? (
        <button
        onClick={handleWalletConnection}
        className="group relative inline-flex h-[56px] items-center justify-center rounded-full bg-neutral-950 py-1 pl-6 pr-14 font-medium text-neutral-50"
      >
        <span className="z-10 pr-2">Connect Wallet</span>
        <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-neutral-700 transition-[width] duration-300 ease-in-out group-hover:w-[calc(100%-8px)]">
          <div className="mr-3.5 flex items-center justify-center">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-neutral-50"
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </button>
      ) : (
        <div className="flex justify-center mt-4">
      <div className="bg-black border border-green-400 text-black-700 px-4 py-2 rounded-2xl shadow-md max-w-fit">
    <p
      className="text-xs font-light text-center"
    >
      Wallet Connected: {walletAddress}
    </p>
  </div>
</div>
      )}
    </div>
  );
}