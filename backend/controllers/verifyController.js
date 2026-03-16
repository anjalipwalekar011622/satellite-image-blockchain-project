const hashService = require("../services/hashService");

// temporary storage
let storedHash = null;

exports.storeHash = (hash) => {
    storedHash = hash;
};

exports.verifyImage = (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No image file uploaded"
            });
        }

        const imageBuffer = req.file.buffer;

        const newHash = hashService.generateHash(imageBuffer);

        if (!storedHash) {
            return res.json({
                message: "No stored hash available for verification"
            });
        }

        if (newHash === storedHash) {

            res.json({
                result: "Image Authentic",
                hash: newHash
            });

        } else {

            res.json({
                result: "Image Tampered",
                hash: newHash
            });

        }

    } catch (error) {

        console.log("VERIFY ERROR:", error);

        res.status(500).json({
            error: "Verification failed"
        });

    }

};