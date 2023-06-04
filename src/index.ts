// eslint-disable-next-line no-console

import { ethers } from 'ethers';
import * as fs from 'fs';

import { env } from './config';
import { pinFileToIPFS } from './pin';


async function reveal() {
  // Upload content to ipfs
  // Submit reveal to infura
  console.log('Revealing');

  const provider = new ethers.providers.InfuraProvider('matic', env.infuraKey);
  const signer = new ethers.Wallet(env.privateKey, provider);

  const plantoidMetadataAddress = env.plantoidMetadataAddress;
  const plantoidAddress = env.plantoidAddress;

  const files = fs.readdirSync(env.inputFolder);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    console.log(file);
    const res = await pinFileToIPFS(env.inputFolder + file);
    console.log({ res });
    const ipfsHash = res.data.IpfsHash;
    const tokenUri = 'ipfs://' + ipfsHash;
    console.log({ ipfsHash });

    const tokenId = file.split('.json')[0];

    const msgHash = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(
        ['uint256', 'string', 'address'],
        [tokenId, tokenUri, plantoidAddress],
      ),
    );
    const sig = await signer.signMessage(msgHash);

    const iface = new ethers.utils.Interface([
      'function revealMetadata(address plantoid, uint256 tokenId, string tokenUri, bytes signature)',
    ]);
    const data = iface.encodeFunctionData('revealMetadata', [
      plantoidAddress,
      tokenId,
      tokenUri,
      sig
    ]);

    const tx = {
      to: plantoidMetadataAddress,
      data: data,
      gas: '100000',
      schedule: 'fast',
    };
    console.log(tx);

    const relayTransactionHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'bytes', 'uint', 'uint', 'string'],
        [tx.to, tx.data, tx.gas, 137, tx.schedule], // Rinkeby chainId is 4
      ),
    );

    const signature = await signer.signMessage(
      ethers.utils.arrayify(relayTransactionHash),
    );

    const { relayTransaction } = await provider.send('relay_sendTransaction', [
      tx,
      signature,
    ]);
    console.log(`ITX relay hash: ${relayTransaction}`);
    fs.renameSync(env.inputFolder + file, env.outputFolder + file);
  }
}


async function run() {
  await reveal();
  console.log("Finished reveal. Checking again in 10 seconds")
  await new Promise(res=>setTimeout(res,10000))
  process.nextTick(run)
}


run();
