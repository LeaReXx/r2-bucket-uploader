import {
  UploadPartCommand,
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY as string,
    secretAccessKey: process.env.R2_SECRET_KEY as string,
  },
});

// Checks for required environment variables
function checkEnvVars(): string | null {
  const requiredEnvVars = ['R2_ENDPOINT', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'R2_BUCKET_NAME'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    return `Missing required environment variables: ${missingEnvVars.join(', ')}`;
  }
  return null;
}

export async function POST(request: Request): Promise<Response> {

  const envError = checkEnvVars();
  if (envError) {
    return new Response(JSON.stringify({ error: envError }), {
      status: 500,
    });
  }

  const formData = await request.formData();
  const endpoint = formData.get("endPoint");

  switch (endpoint) {
    case "create-multipart-upload":
      return createMultipartUpload(formData);
    case "complete-multipart-upload":
      return completeMultipartUpload(formData);
    case "abort-multipart-upload":
      return abortMultipartUpload(formData);
    case "upload-part":
      return uploadPart(formData);
    default:
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
      });
  }
}

// Initiates a multipart upload
async function createMultipartUpload(formData: FormData): Promise<Response> {
  const fileName = formData.get("fileName") as string;
  const fileType = formData.get("fileType") as string;

  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    };

    const command = new CreateMultipartUploadCommand({ ...params });
    const response = await R2.send(command);

    return new Response(
      JSON.stringify({
        uploadId: response.UploadId,
        key: response.Key,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.log("Error From Create Multipart Upload => ", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// Completes a multipart upload
async function completeMultipartUpload(formData: FormData): Promise<Response> {
  const key = formData.get("key") as string;
  const uploadId = formData.get("uploadId") as string;
  const parts = JSON.parse(formData.get("parts") as string);

  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    };
    const command = new CompleteMultipartUploadCommand({ ...params });
    const response = await R2.send(command);

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err) {
    console.log("Error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// Aborts a multipart upload
async function abortMultipartUpload(formData: FormData): Promise<Response> {
  const key = formData.get("key") as string;
  const uploadId = formData.get("uploadId") as string;

  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    };
    const command = new AbortMultipartUploadCommand({ ...params });
    const response = await R2.send(command);

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err) {
    console.log("Error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// Uploads a part of a file
async function uploadPart(formData: FormData): Promise<Response> {
  const key = formData.get("key") as string;
  const uploadId = formData.get("uploadId") as string;
  const partNumber = Number(formData.get("partNumber")) as number;
  const chunk = formData.get("chunk") as File;

  try {
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: buffer,
    };

    const command = new UploadPartCommand({ ...params });
    const response = await R2.send(command);

    return new Response(JSON.stringify({ etag: response.ETag }), {
      status: 200,
    });
  } catch (err) {
    console.log("Error From Uploadpart => ", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}