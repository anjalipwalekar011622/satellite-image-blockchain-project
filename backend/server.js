const express = require("express");
const cors = require("cors");
const { generateHash } = require("./services/hashService");
const { generateGeohash } = require("./services/geohashService");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {

    const hash = generateHash("test-image");

    const geohash = generateGeohash(19.0760, 72.8777);

    res.send(`Backend running. Hash: ${hash} | Geohash: ${geohash}`);
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});