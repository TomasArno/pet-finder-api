import { Router } from "express";

import { AuthController } from "../controllers/auth";
import { UserController } from "../controllers/user";

import { validateUser } from "../schemas/user";

import { verifyJwtToken } from "../middlewares/authJwt";
import { getSHA256 } from "../utilities";
import { number } from "zod";

export const usersRouter = Router();

//guardar en auth solo id y pass y cuando deshasheo el jwt y saco el id ahi puedo acceder a la tabla auth

usersRouter.post("/signup", async (req, res) => {
  const result = validateUser(req.body);

  if (!result.success)
    return res.status(400).json({
      error: result["error"],
      message: "All fields are required...",
    });

  const { email, password } = result.data;

  const userExist = await UserController.getUserByEmail(email);

  if (userExist)
    return res.status(400).json({ message: "Email already in use" });

  const userRecord = await UserController.newUser(email);
  const authRecord = await AuthController.newAuth({
    ...result.data,
    password: getSHA256(password),
    userRecord,
  });

  if (!authRecord)
    return res.status(500).json({ message: "Something went wrong" });

  const token = AuthController.createJwtToken(authRecord);

  res.status(201).json({ token });
});

usersRouter.post("/login", async (req, res) => {
  const result = validateUser(req.body);

  if (!result.success)
    return res.status(400).json({
      error: result["error"],
      message: "All fields are required...",
    });

  const { email, password } = result.data;

  const userExist = await UserController.getUserByEmail(email);
  if (!userExist)
    return res.status(404).json({ message: "Email not registered" });

  const authRecord = await AuthController.getAuth({
    ...result.data,
    password: getSHA256(password),
  });

  if (!authRecord)
    return res.status(400).json({ message: "Incorrect password" });

  const token = AuthController.createJwtToken(authRecord);

  res.status(200).json({ token });
});

usersRouter.get("/test", verifyJwtToken, async (req, res) => {
  res
    .status(200)
    .json([await UserController.getAll(), await AuthController.getAll()]);
});

usersRouter.get("/me", verifyJwtToken, async (req, res) => {
  const user = await UserController.getUserById(req["_user"].id);

  if (!user) return res.status(400).json({ message: "User Not Found" });

  res.status(200).json({ userId: user.dataValues.id });
});

usersRouter.put("/:userId", verifyJwtToken, async (req, res) => {
  const { userId } = req.params;

  if (
    (req.body.oldPassword && req.body.newPassword) ||
    (req.body.oldEmail && req.body.newEmail)
  ) {
    let affectedAuth: [] | number;

    if (req.body.oldPassword && req.body.newPassword) {
      const { newPassword, oldPassword } = req.body;

      [affectedAuth] = await AuthController.changeCredentials(
        {
          oldPassword: getSHA256(oldPassword),
          newPassword: getSHA256(newPassword),
        },
        userId
      );
    } else if (req.body.oldEmail && req.body.newEmail) {
      const { oldEmail, newEmail } = req.body;

      const [affectedUsers] = await UserController.changeEmail(
        {
          oldEmail,
          newEmail,
        },
        userId
      );

      if (!affectedUsers)
        return res.status(404).json({ error: "User Not found" });

      [affectedAuth] = await AuthController.changeEmail(
        {
          oldEmail,
          newEmail,
        },
        userId
      );
    }

    affectedAuth
      ? res.status(200).json({ message: "Modified successfully" })
      : res.status(404).json({ error: "User Not found" });
  }
});
