const express = require("express");
const rotas = express();
const multer = require("./multer");
const aws = require("aws-sdk");

const endpoint = new aws.Endpoint(process.env.ENDPOINT_S3);

const s3 = new aws.S3({
  endpoint,
  credentials: {
    accessKeyId: process.env.KEY_ID,
    secretAccessKey: process.env.APP_KEY,
  },
});

rotas.get("/", (req, res) => {
  return res.status(200).json("OK");
});

rotas.post("/upload", multer.single("arquivo"), async (req, res) => {
  const { file } = req;
  try {
    console.log(req.file);

    const arquivo = await s3
      .upload({
        Bucket: process.env.BACKBLAZE_BUCKET,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return res.json(arquivo);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ mensagen: "Error interno do servidor..." });
  }
});

rotas.get("/files", async (req, res) => {
  //return res.status(200).json("OK");
  try {
    const arquivos = await s3
      .listObjects({
        Bucket: process.env.BACKBLAZE_BUCKET,
      })
      .promise();
    return res.json(arquivos.Contents);
  } catch (error) {
    return res.status(500).json({ mensagen: "Error interno do servidor..." });
  }
});

module.exports = rotas;
