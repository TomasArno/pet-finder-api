import * as jwt from "jsonwebtoken";

import { Auth } from "../models";

const SECRET_KEY = process.env.SECRET_KEY_JWT;

export class AuthController {
  static async newAuth(authData) {
    const { email, password, userRecord } = authData;

    return await Auth.create({
      email,
      password,
      userId: userRecord.get("id"),
    });
  }

  // static async findAuth(userId: string) {
  //   return await Auth.findOne({
  //     where: { userId },
  //   });
  // }

  static async changeCredentials(
    credentials: {
      oldPassword: string;
      newPassword: string;
    },
    userId: string
  ) {
    // agregar validacion x si meten misma contraseña o si es distinta la oldPass
    const { newPassword, oldPassword } = credentials;
    return await Auth.update(
      { password: newPassword },
      {
        where: {
          userId,
          password: oldPassword,
        },
      }
    );
  }

  static async changeEmail(
    credentials: {
      oldEmail: string;
      newEmail: string;
    },
    userId: string
  ) {
    const { newEmail, oldEmail } = credentials;

    return await Auth.update(
      { email: newEmail },
      {
        where: {
          userId,
          email: oldEmail,
        },
      }
    );
  }

  static async getAuth(authData) {
    const { email, password } = authData;

    const auth = await Auth.findOne({
      where: { email, password },
    });

    return auth;
  }

  static async getAll() {
    return await Auth.findAll();
  }

  static createJwtToken(authRecord) {
    const token = jwt.sign({ id: authRecord.get("userId") }, SECRET_KEY);
    return token;
  }
}
