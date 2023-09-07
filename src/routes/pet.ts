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

  req.body.imgURL = "https://picsum.photos/200/300"; // MOCK
  req.body.userId = req["_user"].id;

  const newPet = await PetController.create({ ...result.data });

  if (!newPet)
    return res.status(500).json({ error: "Error while creation the pet" });

  res.status(201).json(newPet);
});

petsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  console.log("entré bien");

  console.log(req.socket.remoteAddress, "ip"); // No funciona porque es un monorepo, hacer 2 proyectos distintos

  const searchedPet = await PetController.getMyPets(parseInt(id));

  if (!searchedPet)
    return res.status(400).json({ message: "Searched pet doesn't exist" });

  res.status(200).json(searchedPet);
});

petsRouter.get("/", async (req, res) => {
  console.log("entré mal");
  res.status(200).json(await PetController.getAllPets());
});

petsRouter.get("/:lat/:lng", async (req, res) => {
  const { lat, lng } = req.params;

  // const nearbyPets = await PetController.getNearbyPets(lat, lng);
  const nearbyPets = await PetController.getNearbyPetsWithIP();

  res.json(nearbyPets);
});
