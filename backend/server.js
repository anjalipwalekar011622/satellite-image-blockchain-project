const express = require("express");
const cors = require("cors");
const { generateHash } = require("./services/hashService");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {

    const hash = generateHash("test-image");

    res.send(`Backend running. Sample hash: ${hash}`);
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});