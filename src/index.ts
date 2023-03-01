// eslint-disable-next-line no-console

import plantoidMetadata from './abi/plantoidMetadata';
import plantoid from './abi/plantoid';
import { ethers } from 'ethers';
import * as fs from 'fs';

import { env } from './config';
import { pinFileToIPFS } from './pin';

function doStuff() {
  // code to run
  console.log('Hello world!');
}

async function reveal() {
  // Upload content to ipfs
  // Submit reveal to infura
  console.log('Revealing');

  const provider = new ethers.providers.InfuraProvider('goerli', env.infuraKey);
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
        [tx.to, tx.data, tx.gas, 5, tx.schedule], // Rinkeby chainId is 4
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
  }
}

async function listen() {
  console.log('Hello world!');
  const plantoidMetadataAddress = '0xB36d0593c0659996611e854b1d7797bF7829BbEE';
  const plantoidAddress = '0xf8f838dc69d59ea02ee0e25d7f0e982a6248f58d';
  const infuraApiKey = env.infuraKey;
  const privatekey = env.privateKey;

  const provider = new ethers.providers.InfuraProvider('goerli', infuraApiKey);
  const signer = new ethers.Wallet(privatekey, provider);
  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const metadataContract = new ethers.Contract(
    plantoidMetadataAddress,
    plantoidMetadata,
    signer,
  );
  const plantoidContract = new ethers.Contract(
    plantoidAddress,
    plantoid,
    signer,
  );

  // const iface = new ethers.utils.Interface(['function echo(string message)']);
  // const data = iface.encodeFunctionData('echo', ['Hello world 3!  ']);
  // const tx = {
  //   to: '0x6663184b3521bF1896Ba6e1E776AB94c317204B6',
  //   data: data,
  //   gas: '800000',
  //   schedule: 'fast',
  // };
  // console.log(tx);

  // const relayTransactionHash = ethers.utils.keccak256(
  //   ethers.utils.defaultAbiCoder.encode(
  //     ['address', 'bytes', 'uint', 'uint', 'string'],
  //     [tx.to, tx.data, tx.gas, 5, tx.schedule], // Rinkeby chainId is 4
  //   ),
  // );

  // const signature = await signer.signMessage(
  //   ethers.utils.arrayify(relayTransactionHash),
  // );

  // const { relayTransaction } = await provider.send('relay_sendTransaction', [
  //   tx,
  //   signature,
  // ]);
  // console.log(`ITX relay hash: ${relayTransaction}`);

  plantoidContract.on('Deposit', (amount, from, tokenId) => {
    console.log(amount, from, tokenId);
  });
}

async function run() {
  reveal();
  // listen()
}

run();
