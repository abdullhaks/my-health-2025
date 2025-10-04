import { uploadFileToS3, getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IDirectDocUploadS3Service from "../interfaces/IDirectDocUploadS3Service";

export default class DirectDocUploadS3Service
  implements IDirectDocUploadS3Service
{
  constructor() {}
  async directUpload(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    location: string
  ): Promise<{ message: string; signedUrl: string,fileKey:string,publicLink:string }> {
    if (!file) {
      throw new Error("Document is required for upload");
    }

    const links = await uploadFileToS3(
      file.buffer,
      file.originalname,
      location,
      file.mimetype
    );

    if (!links.fileUrl || !links.uniqueFileName) {
      console.log("here....1")
      throw new Error("Failed to upload document to S3");
    }

    let signedUrl: string = await getSignedImageURL(links.uniqueFileName);

    if (!signedUrl) {
      console.log("here....2")

      throw new Error("Failed to upload document to S3");
    }

    return {
      message: "Document uploaded successfully",
      signedUrl: signedUrl,
      fileKey:links.uniqueFileName,
      publicLink:links.fileUrl
    };
  }
}
