# Satellite Image Verification and Retrieval System

A blockchain-based web application for uploading, verifying, and searching satellite images using image hashing, geohash-based indexing, IPFS storage, and Ethereum smart contracts (Ganache).

---

## Features

* Admin-only satellite image upload
* Automatic image hash (SHA-256) generation
* Latitude/longitude based geohash generation
* Image storage on IPFS
* Image metadata storage on blockchain
* Verify whether an image is authentic or tampered
* Search satellite images by location
* Web-based dashboard interface

---

## Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js, Express.js
* Blockchain: Solidity, Ganache, Remix IDE, Ethers.js
* Storage: IPFS / Pinata
* Geolocation Encoding: ngeohash
* File Upload: Multer

---

## Project Structure

```id="3q8m5f"
satellite-image-blockchain-project/
│
├── backend/
│   ├── controllers/
│   │   ├── uploadController.js
│   │   └── verifyController.js
│   ├── routes/
│   │   ├── uploadRoute.js
│   │   └── verifyRoute.js
│   ├── services/
│   │   ├── blockchainService.js
│   │   ├── geohashService.js
│   │   └── hashService.js
│   ├── server.js
│   └── package.json
│
├── blockchain/
│   ├── ABI/
│   │   └── ImageStorage_ABI.json
│   ├── contracts/
│   │   └── ImageStorage.sol
│   └── contractAddress.json
│
├── frontend/
│   └── satellite-dashboard.html
│
├── ipfs/
│   └── ipfsService.js
│
└── README.md
```

---

## How It Works

### 1. Upload Image (Admin Only)

* Admin uploads a satellite image with latitude and longitude
* Backend generates:

  * SHA-256 hash
  * Geohash
  * CID from IPFS
* Metadata (CID, hash, geohash) is stored on the blockchain

---

### 2. Verify Image

* User uploads an image
* Backend generates its hash
* Hash is compared with blockchain records

If a match is found, the image is authentic. Otherwise, it may be tampered or unknown.

---

### 3. Search Image by Location

* User enters latitude and longitude
* Converted into geohash
* Blockchain is queried for matching records
* Images are retrieved from IPFS and displayed

---

## Setup Instructions

### 1. Clone Repository

```id="1rl6y6"
git clone https://github.com/anjalipwalekar011622/satellite-image-blockchain-project.git
cd satellite-image-blockchain-project
```

---

### 2. Install Backend Dependencies

```id="sr8z2r"
cd backend
npm install
```

---

### 3. Start Ganache

```id="1o5pdl"
ganache --host 0.0.0.0 --port 7545 --chain.chainId 1337 --wallet.totalAccounts 10 --wallet.defaultBalance 1000 --wallet.mnemonic "test test test test test test test test test test test junk"
```

If using Codespaces, forward port 7545.

---

### 4. Deploy Smart Contract (Remix)

* Open Remix IDE
* Paste `ImageStorage.sol`
* Compile the contract
* Connect to MetaMask (Ganache network)
* Deploy the contract

Update:

`blockchain/contractAddress.json`

```id="70o2rg"
{
  "address": "YOUR_DEPLOYED_CONTRACT_ADDRESS"
}
```

Copy ABI into:

`blockchain/ABI/ImageStorage_ABI.json`

---

### 5. Configure Private Key

In:

`backend/services/blockchainService.js`

```id="r31h2s"
const PRIVATE_KEY = "YOUR_GANACHE_PRIVATE_KEY";
```

---

### 6. Start Backend Server

```id="v6yy70"
cd backend
node server.js
```

Runs on:

```id="nzb5uq"
http://127.0.0.1:5000
```

---

### 7. Run Frontend

Open:

```id="c5qjz8"
frontend/satellite-dashboard.html
```

(using Live Server)

Ensure API base URL:

```id="rvl3cj"
const API_BASE = "http://127.0.0.1:5000/api";
```

---

## API Endpoints

### Upload Image

```
POST /api/uploadImage
```

Form Data:

* image
* latitude
* longitude

Header:

* x-admin-key

---

### Verify Image

```
POST /api/verifyImage
```

Form Data:

* image

---

### Search by Location

```
GET /api/search?lat=LATITUDE&lng=LONGITUDE
```

---

## Smart Contract Functions

* storeImage(string _cid, string _hash, string _geohash)
* verifyByHash(string _hash)
* getImagesByGeohash(string _geohash)
* getImage(uint index)
* getTotalImages()

---

## Admin Access

Only admin can upload images.
Access is controlled using request header:

```
x-admin-key
```

---

## Important Note

If Ganache is restarted:

* Blockchain data resets
* You must redeploy the smart contract
* Update contract address
* Upload images again

---

## Future Enhancements

* Store latitude and longitude directly in smart contract
* Add proper authentication system
* Map-based satellite image search
* Improve geospatial querying
* Hybrid database + blockchain storage

---

## Authors

* Anjali P. Walekar
* Anushree Verma
* Srushti Thakur
* Allison Suvarna

---

This project demonstrates the use of blockchain for secure and tamper-proof geospatial data management.
