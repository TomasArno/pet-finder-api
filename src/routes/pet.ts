import { Router } from "express";

import { sgMail } from "../libs/sendgrid";

import { PetController } from "../controllers/pet";

import { verifyJwtToken } from "../middlewares/authJwt";

import { validatePet } from "../schemas/pet";

import { utilities } from "../utilities";

export const petsRouter = Router();

petsRouter.post("/", verifyJwtToken, async (req, res) => {
  req.body.imgURL = (
    await utilities.submitImgCloudinary(req.body.imgURL)
  ).secure_url;

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

petsRouter.post("/:petId/report", verifyJwtToken, async (req, res) => {
  const { fullname, phoneNumber, description } = req.body;

  const { petId } = req.params;

  if (!petId || !fullname || !phoneNumber || !description)
    return res.status(400).json({ message: "Missing data" });

  const searchedPet = await PetController.getById(petId);

  if (!searchedPet)
    res.status(404).json({ message: "Searched pet doesn't exist" });

  const petData = searchedPet.dataValues;
  const userData = petData.user.dataValues;

  const msg = utilities.createMsg(userData.email, req.body); // validar

  sgMail
    .send(msg)
    .then(() => {
      res.json("mensaje enviado");
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

petsRouter.get("/", verifyJwtToken, async (req, res) => {
  res.status(200).json(await PetController.getAll());
});

petsRouter.get("/:petId", verifyJwtToken, async (req, res) => {
  const { petId } = req.params;

  const searchedPets = await PetController.getMyPets(petId);

  if (!searchedPets) return res.status(404).json({ error: "PetId not found" });

  res.status(200).json(searchedPets);
});

petsRouter.get("/:lat/:lng", async (req, res) => {
  const { lat, lng } = req.params;
  console.log(lat, lng);

  const nearbyPets = await PetController.getNearbyPets(lat, lng);

  if (nearbyPets.status == 400) {
    const { message } = nearbyPets;

    return res.status(400).json({ error: message });
  }

  return res.status(200).json(nearbyPets);
});

petsRouter.put("/:petId", verifyJwtToken, async (req, res) => {
  const { petId } = req.params;

  const result = validatePet(req.body);

  if (!result.success)
    return res.status(400).json({
      error: result["error"],
      message: "All fields are required...",
    });

  const affectedPetId = await PetController.updateById(petId, result.data);

  if (affectedPetId) {
    return res
      .status(200)
      .json({ message: `Affected pet id: ${affectedPetId}` });
  } else {
    return res.status(404).json({ error: "PetId not found" });
  }
});
