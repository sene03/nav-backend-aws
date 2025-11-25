// index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import {
  S3Client,
  GetObjectCommand,
  ListBucketsCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
app.use(cors());
app.use(express.json());

// ---- S3(Lightsail Object Storage) 클라이언트 설정 ----
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.S3_ENDPOINT, // Lightsail 전용 endpoint 있으면 여기
  forcePathStyle: true, // endpoint 쓸 땐 이 옵션 켜두는 게 안전함
});

// 단일 헬스체크용
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// 🔑 [핵심] 특정 key에 대한 pre-signed URL 생성 API
app.get("/images/presigned", async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) {
      return res.status(400).json({ error: "key query param is required" });
    }

    const bucketName = process.env.S3_BUCKET_NAME;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // URL 유효기간 (초 단위) – 1시간 예시
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60,
    });

    return res.json({ url: signedUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to generate presigned url" });
  }
});

app.get("/debug/s3", async (req, res) => {
  try {
    // 1) 자격증명 자체가 맞는지: ListBuckets로 테스트
    const listResult = await s3Client.send(new ListBucketsCommand({}));

    // 2) 내가 쓰려는 버킷에 실제로 접근 가능한지: HeadBucket으로 테스트
    const headResult = await s3Client.send(
      new HeadBucketCommand({
        Bucket: process.env.S3_BUCKET_NAME,
      })
    );

    return res.json({
      ok: true,
      buckets: listResult.Buckets?.map((b) => b.Name),
      bucketCheck: "HEAD bucket success",
    });
  } catch (err) {
    console.error("[DEBUG] S3 TEST ERROR:", err);
    return res.status(500).json({
      ok: false,
      name: err.name,
      message: err.message,
      code: err.$metadata?.httpStatusCode,
    });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
