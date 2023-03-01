"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
exports.env = {
    pinataApiKey: process.env.PINATA_API_KEY || '',
    pinataSecretKey: process.env.PINATA_SECRET_KEY || '',
    inputFolder: process.env.INPUT_FOLDER || '',
    outputFolder: process.env.OUTPUT_FOLDER || '',
    infuraKey: process.env.INFURA_API_KEY || '',
    privateKey: process.env.PRIVATE_KEY || '',
    plantoidMetadataAddress: process.env.PLANTOID_MD_ADDRESS || '',
    plantoidAddress: process.env.PLANTOID_ADDRESS || '',
};
