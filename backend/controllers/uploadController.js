const hashService = require('../services/hashService');
const geohashService = require('../services/geohashService');

exports.uploadImage = (req, res) => {

    try {

        const imageBuffer = req.file.buffer;

        // Generate SHA256 hash
        const hash = hashService.generateHash(imageBuffer);

        // Dummy coordinates for now
        const latitude = 19.0760;
        const longitude = 72.8777;

        // Generate geohash
        const geohash = geohashService.generateGeohash(latitude, longitude);

        // Simulated CID (IPFS will replace this later)
        const cid = "temporaryCID123";

        const metadata = {
            cid,
            hash,
            geohash,
            latitude,
            longitude
        };

        res.json(metadata);

    } catch (error) {

        res.status(500).json({
            error: "Image processing failed"
        });

    }

};