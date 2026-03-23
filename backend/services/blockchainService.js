const { ethers } = require("ethers");

// 🔥 TOGGLE (IMPORTANT)
const ENABLE_BLOCKCHAIN = true;

// Load ABI
const contractABI = require("../../blockchain/ABI/ImageStorage_ABI.json");

// Contract details
const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const RPC_URL = "http://127.0.0.1:8545";

// 🔥 YOUR GANACHE PRIVATE KEY
const PRIVATE_KEY = "0xb128a09798dcc53884d678f90043bd8d1d6c59cc16a6f46dd3eb77c63a2b31ba";

let contract = null;

// 🔒 Only initialize if enabled
if (ENABLE_BLOCKCHAIN) {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // 🔥 FIX: Create wallet using private key
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        // ✅ Contract with wallet (can SEND transactions)
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

        console.log("Blockchain connected ✅");

    } catch (error) {
        console.log("Blockchain not connected ❌", error.message);
    }
} else {
    console.log("Blockchain disabled ⚠️");
}


// 🔹 Store Image on Blockchain
const storeImageOnBlockchain = async (cid, hash, geohash) => {
    try {

        if (!contract) {
            console.log("Skipping blockchain (disabled)");
            return;
        }

        const tx = await contract.storeImage(cid, hash, geohash);
        await tx.wait();

        console.log("Stored on blockchain:", tx.hash);
        return tx.hash;

    } catch (error) {
        console.error("Blockchain store error:", error);
        throw error;
    }
};


// 🔹 Verify Image from Blockchain
const verifyImageOnBlockchain = async (index, hash) => {
    try {

        if (!contract) {
            console.log("Skipping blockchain verify");
            return false;
        }

        const result = await contract.verifyImage(index, hash);
        return result;

    } catch (error) {
        console.error("Blockchain verify error:", error);
        throw error;
    }
};


// 🔹 Get Images by Geohash
const getImagesByGeohash = async (geohash) => {
    try {

        if (!contract) {
            console.log("Skipping blockchain search");
            return [];
        }

        const indexes = await contract.getImagesByGeohash(geohash);

        let results = [];

        for (let i = 0; i < indexes.length; i++) {
            const img = await contract.getImage(indexes[i]);

            results.push({
                cid: img[0],
                hash: img[1],
                geohash: img[2],
                timestamp: img[3],
                uploader: img[4]
            });
        }

        return results;

    } catch (error) {
        console.error("Search error:", error);
        throw error;
    }
};


module.exports = {
    storeImageOnBlockchain,
    verifyImageOnBlockchain,
    getImagesByGeohash
};