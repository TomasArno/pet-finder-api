import { Pet, User } from "../models";
import { index } from "../libs/algolia";

export class PetController {
  static async getNearbyPets(lat = -34.707175, lng = -58.518955) {
    try {
      const res = await index.search("", {
        aroundLatLng: `${lat}, ${lng}`,
        aroundRadius: 1000000000000000, // le llega la query pero no encuentra
      });

      console.log(res);

      return res.hits;
    } catch (error) {
      console.error(error);
      return -1;
    }
  }

  static create(petData) {
    const { name, lat, lng } = petData;

    let pet;

    try {
      pet = Pet.create({
        ...petData,
      });
    } catch (error) {
      console.log(error);
    }

    // try {
    //   await index.saveObject({
    //     objectID: pet.get("id"),
    //     name,
    //     __geoloc: {
    //       lat,
    //       lng,
    //     },
    //   });

    return pet;
    // } catch (error) {
    //   console.log(error);
    // }
  }

  static getAll() {
    return Pet.findAll({
      include: [User],
    });
  }

  static getById(petId: string) {
    return Pet.findByPk(petId, {
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
