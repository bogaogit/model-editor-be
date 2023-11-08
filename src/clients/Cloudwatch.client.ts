import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";

const DEFAULT_REGION = "ap-southeast-2";
export const cloudWatchClient = new CloudWatchClient({ region: DEFAULT_REGION });
