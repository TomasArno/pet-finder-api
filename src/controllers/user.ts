import { User } from "../models";

export class UserController {
  static async newUser(email: string) {
    return await User.create({
      email,
    });
  }

  static async getUserByEmail(email: string) {
    return await User.findOne({
      where: { email },
    });
  }

  static async getUserById(id: number) {
    return await User.findByPk(id);
  }

  static async getAll() {
    return await User.findAll();
  }

  static async changeEmail(
    credentials: {
      oldEmail: string;
      newEmail: string;
    },
    userId: string
  ) {
    const { newEmail, oldEmail } = credentials;

    return await User.update(
      { email: newEmail },
      {
        where: {
          id: userId,
          email: oldEmail,
        },
      }
    );
  }

  // static async findUser(userId: string) {
  //   return await User.findByPk(userId);
  // }
}
