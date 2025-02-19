import {
  UploadPartCommand,
  S3Client,
  ListPartsCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY,
  R2_SECRET_KEY,
  R2_BUCKET_NAME,
} = process.env;

const R2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY as string,
    secretAccessKey: R2_SECRET_KEY as string,
  },
});
export async function POST(request: Request) {
  // خواندن بدنه درخواست یک بار
  const body = await request.json();
  const { endpoint } = body;

  switch (endpoint) {
    case "create-multipart-upload":
      return createMultipartUpload(body);
    case "prepare-upload-parts":
      return prepareUploadParts(body);
    case "complete-multipart-upload":
      return completeMultipartUpload(body);
    case "list-parts":
      return listParts(body);
    case "abort-multipart-upload":
      return abortMultipartUpload(body);
    case "sign-part":
      return signPart(body);
    case "upload-part":
      return uploadPart(body);
    default:
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
      });
  }
}

async function createMultipartUpload(body: any) {
  const { file, contentType } = body;
  const filename = file.name;

  try {
    const params = {
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
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
    console.log("Error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

async function prepareUploadParts(body: any) {
  const { partData } = body;
  const parts = partData.parts;

  const response: { presignedUrls: { [key: string]: string } } = {
    presignedUrls: {},
  };

  for (let part of parts) {
    try {
      const params = {
        Bucket: R2_BUCKET_NAME,
        Key: partData.key,
        PartNumber: part.number,
        UploadId: partData.uploadId,
      };
      const command = new UploadPartCommand({ ...params });
      const url = await getSignedUrl(R2, command, { expiresIn: 3600 });

      response.presignedUrls[part.number] = url;
    } catch (err) {
      console.log("Error", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify(response), { status: 200 });
}

async function listParts(body: any) {
  const { key, uploadId } = body;

  try {
    const params = {
      Bucket: R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    };
    const command = new ListPartsCommand({ ...params });
    const response = await R2.send(command);

    return new Response(JSON.stringify(response["Parts"]), { status: 200 });
  } catch (err) {
    console.log("Error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

async function completeMultipartUpload(body: any) {
  const { key, uploadId, parts } = body;
  console.log(body);

  try {
    const params = {
      Bucket: R2_BUCKET_NAME,
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

async function abortMultipartUpload(body: any) {
  const { key, uploadId } = body;

  try {
    const params = {
      Bucket: R2_BUCKET_NAME,
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

async function signPart(body: any) {
  const { key, uploadId, partNumber } = body;

  const params = {
    Bucket: R2_BUCKET_NAME,
    Key: key,
    PartNumber: partNumber,
    UploadId: uploadId,
  };

  const command = new UploadPartCommand({ ...params });
  const url = await getSignedUrl(R2, command, { expiresIn: 3600 });
  return new Response(JSON.stringify({ url }), { status: 200 });
}

async function uploadPart(body: any) {
  const { key, uploadId, partNumber, chunk } = body;

  try {
    const params = {
      Bucket: R2_BUCKET_NAME,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: Buffer.from(chunk),
    };

    const command = new UploadPartCommand({ ...params });
    const response = await R2.send(command);
    return new Response(JSON.stringify({ etag: response.ETag }), {
      status: 200,
    });
  } catch (err) {
    console.log("Error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
