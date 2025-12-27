module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        baseUrl: env('S3_FILE_URL'), // CDN URL
        rootPath: env('S3_PREFIX', 'strapi'),
        s3Options: {
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY'),
            secretAccessKey: env('S3_SECRET_KEY'),
          },
          region: env('S3_REGION'),
          endpoint: env('S3_ENDPOINT'), // For DigitalOcean Spaces or other S3-compatible
          params: {
            Bucket: env('S3_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
