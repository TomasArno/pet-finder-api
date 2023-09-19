import * as crypto from "crypto";
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

  static createMsg(
    userEmail: string,
    petData: { fullname; phoneNumber; description }
  ) {
    return {
      from: "arnotomas1@gmail.com",
      to: `${userEmail}`,
      subject: "TU MASCOTA HA SIDO VISTA",
      html: `REPORTE DE: ${petData.fullname},\nNÚMERO TELEFÓNICO: ${petData.phoneNumber},\nDESCRIPCIÓN: ${petData.description}`,
    };
  }
}
