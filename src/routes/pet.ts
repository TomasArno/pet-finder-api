import { Router } from "express";

import { PetController } from "../controllers/pet";

import { verifyJwtToken } from "../middlewares/authJwt";

import { validatePet } from "../schemas/pet";

import { submitImgCloudinary } from "../utilities";

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

  res.status(201).json(newPet);
});

petsRouter.get("/", async (req, res) => {
  res.status(200).json(await PetController.getAllPets());
});

petsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const searchedPets = await PetController.getMyPets(parseInt(id));

  if (!searchedPets)
    return res.status(400).json({ message: "Searched pet doesn't exist" });

  res.status(200).json(searchedPets);
});

// petsRouter.get("/:lat/:lng", async (req, res) => {
//   const { lat, lng } = req.params;

//   // const nearbyPets = await PetController.getNearbyPets(lat, lng);
//   const nearbyPets = await PetController.getNearbyPetsWithIP();

//   res.json(nearbyPets);
// });
