import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

export const uploadToIPFS = async (filePath: string) => {
    try {
        const readableStreamForFile = fs.createReadStream(filePath);
        const options = {
            pinataMetadata: {
                name: 'Candidate Image',
            },
        };
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
};

export const uploadJSONToIPFS = async (metadata: any) => {
    try {
        const result = await pinata.pinJSONToIPFS(metadata);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error);
        throw error;
    }
};
