const axios = require("axios");
const FormData = require("form-data");

const PINATA_API_KEY = "6b9abe34f4c1ea0ad096";
const PINATA_SECRET_API_KEY = "899193698dc4c7564b846425df9bf7cb6383b0a2618759cd62c34f834c93ecb1";

exports.uploadToIPFS = async (fileBuffer, fileName) => {
    try {

        const formData = new FormData();

        formData.append("file", fileBuffer, {
            filename: fileName
        });

        const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    ...formData.getHeaders(),
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY
                }
            }
        );

        return res.data.IpfsHash;

    } catch (error) {
        console.error("❌ IPFS Upload Error:", error.message);
        throw error;
    }
};