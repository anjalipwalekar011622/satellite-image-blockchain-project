const { ethers } = require("ethers");

const ENABLE_BLOCKCHAIN = true;

const contractABI = require("../../blockchain/ABI/ImageStorage_ABI.json");

const { address } = require("../../blockchain/contractAddress.json");
const CONTRACT_ADDRESS = address;
const RPC_URL = "http://127.0.0.1:8545";

const PRIVATE_KEY = "0x89e03bc439c2904425f15a2ff2520f33f3c7fd3bb4a285e4527e079173910444";

let contract = null;

if (ENABLE_BLOCKCHAIN) {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

        console.log("Blockchain connected ✅");

    } catch (error) {
        console.log("Blockchain not connected ❌", error.message);
    }
}

// 🔹 Store Image
const storeImageOnBlockchain = async (cid, hash, geohash) => {
    try {
        if (!contract) return;

        const tx = await contract.storeImage(cid, hash, geohash);
        await tx.wait();

        console.log("Stored on blockchain:", tx.hash);
        return tx.hash;

    } catch (error) {
        console.error("Blockchain store error:", error);
        throw error;
    }
};

// 🔹 🔥 VERIFY BY HASH (NEW)
const verifyImageOnBlockchain = async (hash) => {
    try {
        if (!contract) return false;

        const result = await contract.verifyByHash(hash);
        return result;

    } catch (error) {
        console.error("Blockchain verify error:", error);
        throw error;
    }
};

// 🔹 Search
const getImagesByGeohash = async (geohash) => {
    try {
        if (!contract) return [];

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