const Aws = require("aws-sdk");
const db = require('../app');
const {wait} = require('../utils/common')
const http = require('http');
const https = require('https');

Aws.config.update({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: process.env.REGION, 
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Function to fetch file buffer from URL
function getFileBuffer(fileUrl) {
    const protocol = fileUrl.startsWith('https') ? https : http;

    return new Promise((resolve, reject) => {
        protocol.get(fileUrl, response => {
            const chunks = [];
            response.on('data', chunk => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        }).on('error', error => {
            reject(error);
        });
    });
};


  // Function to convert file URL to buffer
async function fileURLToBuffer(fileURL) {
    try {
        const response = await fetch(fileURL);
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        const buffer = await response.arrayBuffer();
        return buffer;
    } catch (error) {
        console.error('Error converting file URL to buffer:', error);
        throw error;
    }
};

let s3bucket = new Aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    Bucket: 'glueple'
});
const uploadImage =  async (req, res) => {
    let {clientCode,total,baseurl,fileName} = req.body 
    let image = JSON.parse(total)
    let file = [];
    for(let i=0;i<image.length;i++){
        let fileURL = `https://${baseurl}/${fileName}/${image[i].file_name}`
        let buffer = await fileURLToBuffer(fileURL)
        file.push({"originalname":image[i].file_name,"buffer":buffer,"fileURL":fileURL})
    }
    s3bucket.createBucket(function () {
        let params ; 
        for(let i=0;i<file.length;i++){
            getFileBuffer(file[i].fileURL)
            .then(buffer => {
            params = {
                Bucket: 'glueple',
                Key: `${clientCode}/${fileName}/${file[i].originalname}`,
                Body: buffer || file[i].buffer,
                ACL: 'public-read'
                
            }
            s3bucket.upload(params, function (err, data) {
                if (err) {
                    res.status(404).json({ error: true, Message: "Something went wrong", data:err });
                } 
                else {
                    res.status(200).json({ error: false, Message: "File save successfully", data });
                }
            });
        });
        }
    });
};

const uploadfile = async(req, res)=>{
        const file = JSON.parse(req.body.file);
        const clientCode = req.body.clientCode
        const fileName = req.body.fileName
        let buffer = Buffer.from(file.buffer.data)
            s3bucket.createBucket(function () {
                params = {
                    Bucket: 'glueple',
                    Key: `${clientCode}/${fileName}/${file.originalname}`,
                    Body: buffer,
                    ACL: 'public-read'
                }
                s3bucket.upload(params, function (err, data) {
                    if (err) {
                        res.status(404).json({ error: true, Message: "Something went wrong", data:err });
                    } 
                    else {
                        res.status(200).json({ error: false, Message: "File save successfully", data });
                    }
                });
            // };
        });

}

const sendbase64Image = async(req, res)=>{
    const fileName = req.body.fileName
    let base64String = req.body.imageBuffer
    const clientCode = req.body.clientCode


    const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
        return res.status(400).send('Invalid base64 string');
    }

    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');
    const mimeType = matches[1];
    const fileExtension = mimeType.split('/')[1];
    const fileNames = `image-${Date.now()}`;
        s3bucket.createBucket(function () {
            params = {
                Bucket: 'glueple',
                Key: `${clientCode}/${fileName}/${fileNames}`,
                Body: buffer,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: `image/${mimeType}` 
            }
            s3bucket.upload(params, function (err, data) {
                if (err) {
                    res.status(404).json({ error: true, Message: "Something went wrong", data:err });
                } 
                else {
                    res.status(200).json({ error: false, Message: "File save successfully", data });
                }
            });
        // };
    });

}

module.exports = {
    uploadImage:uploadImage,
    uploadfile:uploadfile,
    sendbase64Image:sendbase64Image
}