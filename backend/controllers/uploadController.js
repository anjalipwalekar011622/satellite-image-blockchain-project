const hashService = require("../services/hashService");
const geohashService = require("../services/geohashService");
const { storeImageOnBlockchain } = require("../services/blockchainService");
const { uploadToIPFS } = require("../../ipfs/ipfsService");

exports.uploadImage = async (req, res) => {
  try {
    console.log("Upload API hit");

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        error: "Valid latitude and longitude are required"
      });
    }

    const imageBuffer = req.file.buffer;
    const hash = hashService.generateHash(imageBuffer);
    const geohash = geohashService.generateGeohash(latitude, longitude);

    console.log("Hash generated:", hash);
    console.log("Geohash:", geohash);

    const cid = await uploadToIPFS(imageBuffer, req.file.originalname);
    console.log("CID received:", cid);

    const txHash = await storeImageOnBlockchain(cid, hash, geohash);
    console.log("Blockchain TX:", txHash);

    res.json({
      cid,
      hash,
      geohash,
      latitude,
      longitude,
      txHash
    });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({
      error: "Image processing failed",
      details: error.message
    });
  }
};
