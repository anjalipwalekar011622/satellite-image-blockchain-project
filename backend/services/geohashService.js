const ngeohash = require("ngeohash");

function generateGeohash(latitude, longitude) {

    const geohash = ngeohash.encode(latitude, longitude, 6);

    return geohash;
}

module.exports = { generateGeohash };