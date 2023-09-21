import { Pet, User } from "../models";
import { index } from "../libs/algolia";

export abstract class PetController {
  static async getNearbyPets(lat, lng) {
    try {
      const { hits } = await index.search("", {
        aroundLatLng: `${lat}, ${lng}`,
        aroundRadius: 140000,
      });

      return hits;
    } catch (error) {
      return error;
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

  static async updateById(id: string, data: {}) {
    const [affectedPets] = await Pet.update(data, {
      where: { id },
    });

    if (affectedPets) {
      const { objectID } = await index.partialUpdateObject(
        { ...data, objectID: id },
        {
          createIfNotExists: false,
        }
      );

      return objectID;
    } else {
      return 0;
    }
  }

  static async deletebyId(userId: string, petId: string) {
    const affectedPets = await Pet.destroy({
      where: { userId, id: petId },
    });

    if (affectedPets) {
      return await index.deleteObject(petId);
    } else return null;
  }

  static getMyPets(userId: string) {
    return Pet.findAll({
      where: { userId },
    });
  }
}
