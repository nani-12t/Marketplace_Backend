const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.DTP_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.DTP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.DTP_AWS_SECRET_KEY,
  },
});

/**
 * Generates an S3 prefix using user ID and email
 * e.g., incoming/12345_user@example.com/2026-04-30/
 */
const generateS3Prefix = (user) => {
  const dateStr = new Date().toISOString().split('T')[0];
  // fallback to generic name if user email isn't available
  const identifier = `${user._id}_${user.email || 'user'}`;
  return `incoming/${identifier}/${dateStr}/`;
};

/**
 * Generates a presigned URL for uploading a file directly to S3
 */
const generatePresignedUrl = async (fileName, fileType, user) => {
  const prefix = generateS3Prefix(user);
  // Sanitize filename and append unique timestamp to avoid collisions
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueKey = `${prefix}${Date.now()}_${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.DTP_AWS_BUCKET_NAME,
    Key: uniqueKey,
    ContentType: fileType,
  });

  // URL expires in 5 minutes
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const finalUrl = `https://${process.env.DTP_AWS_BUCKET_NAME}.s3.${process.env.DTP_AWS_REGION}.amazonaws.com/${uniqueKey}`;

  return { presignedUrl, finalUrl };
};

module.exports = {
  s3Client,
  generateS3Prefix,
  generatePresignedUrl,
};
