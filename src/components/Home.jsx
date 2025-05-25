import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey, Connection } from "@solana/web3.js";

const Home = () => {
  const { publicKey, connected, sendTransaction, signMessage } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("");
  const [recipent, setRecipent] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

  const sendSol = async () => {
    try {
      if (!recipent || !amount) {
        setStatus("❌ Please enter both recipient address and amount.");
        return;
      }

      const recipientPubKey = new PublicKey(recipent);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      if (isNaN(lamports) || lamports <= 0) {
        setStatus("❌ Invalid amount entered.");
        return;
      }

      setStatus(`Sending ${amount} SOL...`);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports,
        })
      );

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setStatus(`✅ Sent ${amount} SOL! Tx: ${signature}`);
      setRecipent("");
      setAmount("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error sending SOL. Check recipient and amount.");
    }
  };
  const reqAirdrop = async () => {
  try {
    if (!recipent) {
      setStatus("❌ Please enter a recipient public key.");
      return;
    }

    const recipientPubKey = new PublicKey(recipent);
    const lamports = parseFloat(amount)

    setStatus("⏳ Requesting airdrop to recipient...");

    const signature = await connection.requestAirdrop(recipientPubKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature, "confirmed");

    setStatus(`✅ Airdropped 1 SOL to ${recipientPubKey.toBase58()}! Tx: ${signature}`);
  } catch (err) {
    console.error(err);
    setStatus("❌ Airdrop failed. Check the recipient address.");
  }
};


  const signTestMessage = async () => {
    try {
      const message = new TextEncoder().encode("Hello from Solana!");
      const signed = await signMessage(message);
      setStatus(
        `📝 Message signed! Signature: ${Buffer.from(signed).toString("hex").slice(0, 32)}...`
      );
    } catch (err) {
      console.error(err);
      setStatus("❌ Error signing message");
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 text-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white text-black rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">◎ Solana Wallet-Adapter</h1>

        <div className="flex justify-center">
          <WalletMultiButton className="!bg-black !text-white hover:!bg-gray-900 transition duration-300" />
        </div>

        {connected && (
          <>
            <div className="border rounded-lg p-4 bg-gray-100 text-sm">
              <p className="text-gray-600 font-semibold">Connected Wallet:</p>
              <p className="font-mono break-all">{publicKey.toBase58()}</p>
            </div>

            <div className="text-center text-lg font-medium">
              Balance:{" "}
              <span className="text-black font-bold">
                {balance !== null ? `${balance.toFixed(3)} SOL` : "Loading..."}
              </span>
            </div>

            <input
              type="text"
              value={recipent}
              onChange={(e) => setRecipent(e.target.value)}
              placeholder="Enter recipient public key"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-sm mb-2"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (SOL)"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-sm mb-3"
            />

            <div className="space-y-3">
              <button
                onClick={sendSol}
                className="bg-slate-300 text-black w-full px-4 py-2 rounded-xl hover:scale-105 hover:bg-slate-400"
              >
                Send SOL
              </button>
               <div className = "w-fulll flex justify-center items-center">
              <button onClick = { reqAirdrop } className="bg-slate-300 text-black w-full px-4 py-2 rounded-xl hover:scale-105 hover:bg-slate-500">
               Airdrop
              </button>
               </div>

              <button
                onClick={signTestMessage}
                className="bg-slate-300 text-black  w-full px-4 py-2 rounded-xl hover:scale-105 hover:bg-slate-500"
              >
                Sign Message
              </button>
            </div>

            {status && (
              <p className="text-sm text-center text-gray-600 border-t pt-4 break-words">
                {status}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
