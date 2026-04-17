import { SQSClient } from "@aws-sdk/client-sqs";

export function getSQSClient() {
  const queueRegion = process.env.AWS_QUEUE_REGION;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!queueRegion || !accessKey || !secretAccessKey) {
    throw new Error("Missing required AWS environment variables");
  }

  return new SQSClient({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey,
    },
    region: queueRegion,
  });
}
