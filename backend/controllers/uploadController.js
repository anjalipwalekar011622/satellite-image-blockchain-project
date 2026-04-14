const hashService = require("../services/hashService");
const geohashService = require("../services/geohashService");
const { storeImageOnBlockchain } = require("../services/blockchainService");
const { uploadToIPFS } = require("../../ipfs/ipfsService");
const { insertImageRecord } = require("../services/databaseService");

function classifyImage(filename) {
  const name = filename.toLowerCase();

  if (name.includes("forest")) return "Forest";
  if (name.includes("highway")) return "Highway";
  if (name.includes("industrial")) return "Industrial";
  if (name.includes("residential")) return "Residential";
  if (name.includes("pasture") || name.includes("farm") || name.includes("agri")) return "Agricultural";
  if (name.includes("water") || name.includes("river") || name.includes("lake")) return "Water Body";
  if (name.includes("urban") || name.includes("city")) return "Urban";
  if (name.includes("tampered")) return "Unverified";

  return "Satellite Image";
}

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
        error: "Please provide valid latitude and longitude"
      });
    }

    const filename = req.file.originalname;
    const imageTypeFromAdmin = req.body.image_type || req.body.imageType;
    const imageType = imageTypeFromAdmin && imageTypeFromAdmin.trim()
      ? imageTypeFromAdmin.trim()
      : classifyImage(filename);

    const placeName = req.body.place_name || req.body.placeName || "";

    console.log(`Location: lat=${latitude}, lng=${longitude}`);
    console.log("Image Type:", imageType);

    const imageBuffer = req.file.buffer;
    const hash = hashService.generateHash(imageBuffer);
    const geohash = geohashService.generateGeohash(latitude, longitude);

    console.log("Hash:", hash);
    console.log("Geohash:", geohash);

    console.log("Uploading to IPFS...");
    const cid = await uploadToIPFS(imageBuffer, filename);
    console.log("CID:", cid);

    console.log("Storing on blockchain...");
    const txHash = await storeImageOnBlockchain(cid, hash, geohash);
    console.log("Blockchain TX:", txHash);

    const uploadedAt = new Date().toISOString();

    insertImageRecord({
      cid,
      hash,
      geohash,
      latitude,
      longitude,
      place_name: placeName,
      image_type: imageType,
      filename,
      tx_hash: txHash,
      uploaded_at: uploadedAt,
      is_admin_only: 1
    });

    res.json({
      cid,
      hash,
      geohash,
      latitude,
      longitude,
      placeName,
      imageType,
      filename,
      txHash,
      uploadedAt
    });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);

    res.status(500).json({
      error: "Upload failed",
      details: error.message
    });
  }
};
