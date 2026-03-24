// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ImageStorage {

    struct Image {
        string cid;
        string hash;
        string geohash;
        uint timestamp;
        address uploader;
    }

    Image[] public images;

    // Store image metadata
    function storeImage(
        string memory _cid,
        string memory _hash,
        string memory _geohash
    ) public {
        images.push(Image(_cid, _hash, _geohash, block.timestamp, msg.sender));
    }

    // Get image by index
    function getImage(uint index) public view returns (
        string memory,
        string memory,
        string memory,
        uint,
        address
    ) {
        Image memory img = images[index];
        return (img.cid, img.hash, img.geohash, img.timestamp, img.uploader);
    }

    // 🔥 OLD VERIFY (keep it)
    function verifyImage(uint index, string memory _hash) public view returns (bool) {
        return keccak256(bytes(images[index].hash)) == keccak256(bytes(_hash));
    }

    // 🔥 NEW VERIFY (VERY IMPORTANT)
    function verifyByHash(string memory _hash) public view returns (bool) {

    for (uint i = 0; i < images.length; i++) {

        if (
            keccak256(bytes(images[i].hash)) ==
            keccak256(bytes(_hash))
        ) {
            return true;
        }
    }

    return false;
}

    // Search images by geohash
    function getImagesByGeohash(string memory _geohash) public view returns (uint[] memory) {
        uint count = 0;

        for (uint i = 0; i < images.length; i++) {
            if (keccak256(bytes(images[i].geohash)) == keccak256(bytes(_geohash))) {
                count++;
            }
        }

        uint[] memory result = new uint[](count);
        uint j = 0;

        for (uint i = 0; i < images.length; i++) {
            if (keccak256(bytes(images[i].geohash)) == keccak256(bytes(_geohash))) {
                result[j] = i;
                j++;
            }
        }

        return result;
    }

    function getTotalImages() public view returns (uint) {
        return images.length;
    }
}