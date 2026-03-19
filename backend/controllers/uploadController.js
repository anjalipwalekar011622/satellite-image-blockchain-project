const hashService = require("../services/hashService");
const geohashService = require("../services/geohashService");
const verifyController = require("./verifyController");
const { storeImageOnBlockchain } = require("../services/blockchainService");

exports.uploadImage = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No image file uploaded"
            });
        }

        const imageBuffer = req.file.buffer;

        const hash = hashService.generateHash(imageBuffer);

        verifyController.storeHash(hash);

        const latitude = 19.0760;
        const longitude = 72.8777;

        const geohash = geohashService.generateGeohash(latitude, longitude);

        const cid = "TEMP_CID";

        // 🔥 ADD THIS PART (Blockchain call)
        //await storeImageOnBlockchain(cid, hash, geohash);

        const metadata = {
            cid,
            hash,
            geohash,
            latitude,
            longitude
        };

        res.json(metadata);

    } catch (error) {

        console.log("UPLOAD ERROR:", error);

        res.status(500).json({
            error: "Image processing failed",
            details: error.message
        });

    }

};