import * as crypto from "crypto";
import * as sgMail from "@sendgrid/mail";
import { cloudinary } from "../libs/cloudinary";
import { UploadApiResponse } from "cloudinary";

export abstract class utilities {
  static getSHA256(input: string): string {
    return crypto.createHash("sha256").update(input).digest("hex");
  }

  static async submitImgCloudinary(
    imageURL: string
  ): Promise<UploadApiResponse> {
    try {
      return await cloudinary.uploader.upload(imageURL);
    } catch (error) {
      console.log(error);
    }
  }

  static setApiKeySendgrid() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  static createMsg(
    userEmail: string,
    petData: { fullname; phoneNumber; description }
  ) {
    return {
      to: `${userEmail}`,
      from: "arnotomas1@gmail.com",
      subject: "PET REPORT",
      text: `and easy to do anywhere, even with Node.js`,
      // templateId: "d-b080b499b6144d0ab6b1748fd3f05bc1",
      html: `REPORTE DE: ${petData.fullname},NUM TEL: ${petData.phoneNumber},DESCRIPCION: ${petData.description}`,
    };
  }
}
