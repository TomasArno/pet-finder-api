import { Router } from "express";
import * as sgMail from "@sendgrid/mail";

import { PetController } from "../controllers/pet";

import { verifyJwtToken } from "../middlewares/authJwt";

import { validatePet } from "../schemas/pet";

import { utilities } from "../utilities";

export const petsRouter = Router();

petsRouter.post("/", verifyJwtToken, async (req, res) => {
  // req.body.imgURL = (await submitImgCloudinary(req.body.imgURL)).secure_url;
  const result = validatePet(req.body);

  if (!result.success)
    return res.status(400).json({
      error: result["error"],
      message: "All fields are required...",
    });

  result.data.imgURL = "https://picsum.photos/200/300"; // MOCK

  const newPet = await PetController.create({
    ...result.data,
    userId: req["_user"].id,
  });

  if (!newPet)
    return res.status(500).json({ error: "Error while creation the pet" });

  res.status(201).json(newPet.dataValues);
});

petsRouter.get("/", async (req, res) => {
  res.status(200).json(await PetController.getAll());
});

petsRouter.get("/:petId", verifyJwtToken, async (req, res) => {
  const { petId } = req.params;

  const searchedPets = await PetController.getMyPets(petId);

  if (!searchedPets)
    return res.status(400).json({ message: "Searched pet doesn't exist" });

  res.status(200).json(searchedPets);
});

petsRouter.get("/:petId/report", async (req, res) => {
  utilities.setApiKeySendgrid();

  const { petId } = req.params;

  if (!petId) return res.status(404).json({ message: "missing petID" });

  const searchedPet = await PetController.getById(petId);

  if (!searchedPet)
    res.status(404).json({ message: "Searched pet doesn't exist" });

  const petData = searchedPet.dataValues;
  const userData = petData.user.dataValues;

  const msg = utilities.createMsg(userData.email);

  sgMail
    .send(msg)
    .then(() => {
      res.json("mensaje enviado");
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

petsRouter.get("/:lat/:lng", async (req, res) => {
  const { lat, lng } = req.params;

  const nearbyPets = await PetController.getNearbyPets();

  if (!nearbyPets) return res.status(400).json({ message: "No pets nearby" });

  res.status(200).json(nearbyPets);
});

petsRouter.put("/:petId", verifyJwtToken, async (req, res) => {
  const { petId } = req.params;

  const result = validatePet(req.body);

  if (!result.success)
    return res.status(400).json({
      error: result["error"],
      message: "All fields are required...",
    });

  const [affectedPets] = await PetController.updateById(petId, result.data);

  if (affectedPets) {
    res.status(200).json({ message: `Affected pets: ${affectedPets}` });
  } else {
    return res.status(400).json({ message: "PetId not exist" });
  }
});
