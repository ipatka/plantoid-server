import axios from 'axios';
import * as fs from 'fs';
import FormData = require("form-data");

import {env} from './config'

const pinDataToIPFS = async (data: any) => {
  const pinataApiKey = env.pinataApiKey
  const pinataSecretApiKey = env.pinataSecretKey
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  
  const result = await axios.post(url, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary= ${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
  if (result.status !== 200) throw new Error('failed to pin content')
  return result
};

export const pinFileToIPFS = async (filePath: string) => {
  let data = new FormData();
  
  data.append("file", fs.createReadStream(filePath));
  
  return await pinDataToIPFS(data)
}

export const pinMetadataToIPFS = async (metadata: string) => {

  const pinataApiKey = process.env.PINATA_API_KEY
  const pinataSecretApiKey = process.env.PINATA_SECRET_KEY

  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

  const result = await axios.post(
    url,
    metadata,
    {
      headers: {
      'pinata_api_key': pinataApiKey, 
      'pinata_secret_api_key': pinataSecretApiKey, 
      'Content-Type': 'application/json'

      }
    }
  )

  if (result.status !== 200) throw new Error('failed to pin metadata')

  return result

};

export const fetchContent = async (ipfsHash: string) => {
  const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  const result = await axios.get(url)
  if (result.status !== 200) throw new Error('failed to pin metadata')
  return result.data
}