import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import { ethers } from "ethers";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { walletAddress, signature } = await req.json();

    if (!walletAddress || !signature) {
      return new Response(
        JSON.stringify({ error: "Wallet address and signature are required." }),
        { status: 400 }
      );
    }

    // Recreate the message and verify the signature
    const message = `Sign up for MEV Analyzer with wallet: ${walletAddress}`;
    const recoveredAddress = ethers.verifyMessage(message, signature); // ethers v6

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Invalid signature." }),
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Wallet address already registered." }),
        { status: 200 } // 200 because it's not an error; the user exists
      );
    }

    // Save the user
    const newUser = new User({ walletAddress, signature });
    await newUser.save();

    return new Response(
      JSON.stringify({ message: "Wallet address registered successfully." }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in storeWallet API:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500 }
    );
  }
}
