const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const s3 = new S3Client({ region: AWS_REGION });

// Helper to decode base64 and get buffer and mime
function decodeBase64Image(dataString) {
    const matches = dataString.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }
    return {
        mime: matches[1],
        buffer: Buffer.from(matches[2], 'base64'),
    };
}

// Upload a base64 image to S3, returns the S3 key
async function uploadBase64ImageToS3(base64Image, folder = 'menu') {
    const { mime, buffer } = decodeBase64Image(base64Image);
    const ext = mime.split('/')[1];
    const key = `${folder}/${uuidv4()}.${ext}`;
    const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mime,
        ACL: 'public-read',
    });
    await s3.send(command);
    return key;
}

// Get a public URL for an S3 object (assumes public-read ACL)
function getS3ObjectUrl(key) {
    return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

// Delete an object from S3
async function deleteS3Object(key) {
    const command = new DeleteObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
    });
    await s3.send(command);
}

// Upload multiple base64 images to S3, returns array of S3 URLs
async function uploadMultipleBase64Images(base64Images, folder = 'feedback') {
    const urls = [];
    for (const base64Image of base64Images) {
        const key = await uploadBase64ImageToS3(base64Image, folder);
        urls.push(getS3ObjectUrl(key));
    }
    return urls;
}

module.exports = {
    uploadBase64ImageToS3,
    getS3ObjectUrl,
    deleteS3Object,
    uploadMultipleBase64Images,
}; 