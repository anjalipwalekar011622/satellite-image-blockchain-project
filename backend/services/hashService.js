const crypto = require("crypto");

function generateHash(data) {
    const hash = crypto
        .createHash("sha256")
        .update(data)
        .digest("hex");

    return hash;
}

module.exports = { generateHash };