const express = require("express");
const cors = require("cors");
const { generateHash } = require("./services/hashService");
const { generateGeohash } = require("./services/geohashService");
const uploadRoute = require("./routes/uploadRoute");
const verifyRoute = require("./routes/verifyRoute");
const authRoute = require("./routes/authRoute");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", uploadRoute);
app.use("/api", verifyRoute);
app.use("/api/auth", authRoute);


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