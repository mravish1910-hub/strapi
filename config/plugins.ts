export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('S3_FILE_URL'),
        rootPath: env('S3_ROOT_PATH', 'strapi'),
        s3Options: {
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY'),
            secretAccessKey: env('S3_SECRET_KEY'),
          },
          endpoint: env('S3_ENDPOINT'),
          region: env('S3_REGION', 'us-east-1'),
          params: {
            Bucket: env('S3_BUCKET'),
          },
          // Required for DigitalOcean Spaces
          forcePathStyle: true,
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
