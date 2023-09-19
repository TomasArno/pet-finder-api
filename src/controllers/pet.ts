import { Pet, User } from "../models";
import { index } from "../libs/algolia";

export class PetController {
  static async getNearbyPets(lat, lng) {
    try {
      const { hits } = await index.search("", {
        aroundLatLng: `${lat}, ${lng}`,
        aroundRadius: 7000,
      });

      return hits;
    } catch (error) {
      console.error(error);
      return -1;
    }
  }

  static async create(petData) {
    let pet;

    try {
      pet = await Pet.create({
        ...petData,
      });
    } catch (error) {
      console.log(error);
    }

    try {
      await index.saveObject({
        objectID: pet.get("id"),
        name: pet.get("name"),
        imgURL: pet.get("imgURL"),
        _geoloc: {
          lat: pet.get("lat"),
          lng: pet.get("lng"),
        },
      });
    } catch (error) {
      console.log(error);
    }

    return pet;
  }

  static getAll() {
    return Pet.findAll({
      include: [User],
    });
  }

  static async getById(petId: string) {
    return await Pet.findByPk(petId, {
      include: [User],
    });
  }

  static updateById(id: string, data: {}) {
    return Pet.update(data, {
      where: { id },
    });
  }

  static getMyPets(userId: string) {
    return Pet.findAll({
      where: { userId },
    });
  }
}
