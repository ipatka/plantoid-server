"use strict";
// eslint-disable-next-line no-console
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var fs = __importStar(require("fs"));
var config_1 = require("./config");
var pin_1 = require("./pin");
function reveal() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, signer, plantoidMetadataAddress, plantoidAddress, files, index, file, res, ipfsHash, tokenUri, tokenId, msgHash, sig, iface, data, tx, relayTransactionHash, signature, relayTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Upload content to ipfs
                    // Submit reveal to infura
                    console.log('Revealing');
                    provider = new ethers_1.ethers.providers.InfuraProvider('goerli', config_1.env.infuraKey);
                    signer = new ethers_1.ethers.Wallet(config_1.env.privateKey, provider);
                    plantoidMetadataAddress = config_1.env.plantoidMetadataAddress;
                    plantoidAddress = config_1.env.plantoidAddress;
                    files = fs.readdirSync(config_1.env.inputFolder);
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < files.length)) return [3 /*break*/, 7];
                    file = files[index];
                    console.log(file);
                    return [4 /*yield*/, (0, pin_1.pinFileToIPFS)(config_1.env.inputFolder + file)];
                case 2:
                    res = _a.sent();
                    console.log({ res: res });
                    ipfsHash = res.data.IpfsHash;
                    tokenUri = 'ipfs://' + ipfsHash;
                    console.log({ ipfsHash: ipfsHash });
                    tokenId = file.split('.json')[0];
                    msgHash = ethers_1.ethers.utils.arrayify(ethers_1.ethers.utils.solidityKeccak256(['uint256', 'string', 'address'], [tokenId, tokenUri, plantoidAddress]));
                    return [4 /*yield*/, signer.signMessage(msgHash)];
                case 3:
                    sig = _a.sent();
                    iface = new ethers_1.ethers.utils.Interface([
                        'function revealMetadata(address plantoid, uint256 tokenId, string tokenUri, bytes signature)',
                    ]);
                    data = iface.encodeFunctionData('revealMetadata', [
                        plantoidAddress,
                        tokenId,
                        tokenUri,
                        sig
                    ]);
                    tx = {
                        to: plantoidMetadataAddress,
                        data: data,
                        gas: '100000',
                        schedule: 'fast',
                    };
                    console.log(tx);
                    relayTransactionHash = ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.defaultAbiCoder.encode(['address', 'bytes', 'uint', 'uint', 'string'], [tx.to, tx.data, tx.gas, 5, tx.schedule]));
                    return [4 /*yield*/, signer.signMessage(ethers_1.ethers.utils.arrayify(relayTransactionHash))];
                case 4:
                    signature = _a.sent();
                    return [4 /*yield*/, provider.send('relay_sendTransaction', [
                            tx,
                            signature,
                        ])];
                case 5:
                    relayTransaction = (_a.sent()).relayTransaction;
                    console.log("ITX relay hash: ".concat(relayTransaction));
                    _a.label = 6;
                case 6:
                    index++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            reveal();
            return [2 /*return*/];
        });
    });
}
run();
