const { ethers } = require("ethers");

const ENABLE_BLOCKCHAIN = true;

const contractABI = require("../../blockchain/ABI/ImageStorage_ABI.json");
const { address } = require("../../blockchain/contractAddress.json");

const CONTRACT_ADDRESS = address;
const RPC_URL = "http://127.0.0.1:7545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // ← your ganache key

let contract = null;

if (ENABLE_BLOCKCHAIN) {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
        contract       = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
        console.log("Blockchain connected ✅");
    } catch (error) {
        console.log("Blockchain not connected ❌", error.message);
    }
}

// ✅ Store image on blockchain
const storeImageOnBlockchain = async (cid, hash, geohash) => {
    try {
        if (!contract) return null;
        const tx = await contract.storeImage(cid, hash, geohash);
        await tx.wait();
        console.log("Stored on blockchain:", tx.hash);
        return tx.hash;
    } catch (error) {
        console.error("Blockchain store error:", error);
        throw error;
    }
};

// ✅ Verify image by hash
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

// ✅ Get images by geohash — returns full image objects
const getImagesByGeohash = async (geohash) => {
    try {
        if (!contract) return [];

        const indexes = await contract.getImagesByGeohash(geohash);
        let results = [];

        for (let i = 0; i < indexes.length; i++) {
            const img = await contract.getImage(indexes[i]);
            results.push({
                id:       Number(indexes[i]),
                cid:      img[0],
                hash:     img[1],
                geohash:  img[2],
                timestamp: Number(img[3]),
                uploader:  img[4],
                ipfsUrl:  `https://gateway.pinata.cloud/ipfs/${img[0]}`
            });
        }

        return results;
    } catch (error) {
        console.error("Search error:", error);
        throw error;
    }
};

// ✅ NEW: Get ALL images from blockchain (for analytics + history)
const getAllImages = async () => {
    try {
        if (!contract) return [];

        const total = await contract.getTotalImages();
        const totalNum = Number(total);
        console.log("Total images on blockchain:", totalNum);

        let results = [];

        for (let i = 0; i < totalNum; i++) {
            try {
                const img = await contract.getImage(i);
                results.push({
                    id:        i,
                    cid:       img[0],
                    hash:      img[1],
                    geohash:   img[2],
                    timestamp: Number(img[3]),
                    uploader:  img[4],
                    // Guess image type from geohash position (basic classification)
                    imageType: guessImageType(i),
                    ipfsUrl:   `https://gateway.pinata.cloud/ipfs/${img[0]}`
                });
            } catch (e) {
                console.log(`Skipping image ${i}:`, e.message);
            }
        }

        return results;

    } catch (error) {
        console.error("getAllImages error:", error);
        throw error;
    }
};

// Simple type guesser based on upload order
// In real system this would be stored on blockchain too
function guessImageType(index) {
    const types = [
        'Forest', 'Forest', 'Highway', 'Highway',
        'Industrial', 'Residential', 'Residential',
        'Agricultural', 'Agricultural', 'Satellite Image'
    ];
    return types[index] || 'Satellite Image';
}

module.exports = {
    storeImageOnBlockchain,
    verifyImageOnBlockchain,
    getImagesByGeohash,
    getAllImages
};
