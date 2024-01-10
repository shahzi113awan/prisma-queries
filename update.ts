export async function update(id: bigint, payload: editForm | FormData) {
    const validated = await editFormValidator.validateAsync(payload);
  
    const previouSportIds = await db.property_sport.findMany({
      where: {
        property_id: id,
      },
    });
    const previouSportIdsArray = previouSportIds.map((_) => _.sport_id);
    const newIdsArray = validated.sport_ids;
    const idsToDelete = previouSportIdsArray.filter(
      (_) => !newIdsArray?.includes(_),
    );
    await db.property_sport.deleteMany({
      where: {
        property_id: id,
        sport_id: {
          in: idsToDelete,
        },
      },
    });
  
    //Nation disconnect
  //No need to filter out the ids we are deleting all and then connecting new ones
    const previouNationIds = await db.property_nation.findMany({
      where: {
        property_id: id,
      },
    });
    const previouNationIdsArray = previouNationIds.map((_) => _.nation_id);
    const newNationIdsArray = validated.nation_ids;
    const idsToDeleteNation = previouNationIdsArray.filter(
      (_) => !newNationIdsArray?.includes(_),
    );
  
    await db.property_nation.deleteMany({
      where: {
        property_id: id,
        nation_id: {
          in: idsToDeleteNation,
        },
      },
    });
  
    //continents disconnect
  
    const previouContinentIds = await db.property_continent.findMany({
      where: {
        property_id: id,
      },
    });
    const previouContinentIdsArray = previouContinentIds.map(
      (_) => _.continent_id,
    );
    const newContinentIdsArray = validated.continent_ids;
    const idsToDeleteContinent = previouContinentIdsArray.filter(
      (_) => !newContinentIdsArray?.includes(_),
    );
  
    await db.property_continent.deleteMany({
      where: {
        property_id: id,
        continent_id: {
          in: idsToDeleteContinent,
        },
      },
    });
  
    const { nation_ids, continent_ids, sport_ids, ...rest } = validated;
    await db.properties.update({
      where: { id },
      data: {
        ...rest,
        nations: {
          connectOrCreate: nation_ids?.map((_) => {
            return {
              where: { property_id_nation_id: { property_id: id, nation_id: _ } },
              create: {
                nation: {
                  connect: {
                    id: _,
                  },
                },
              },
            };
          }),
        },
        continents: {
          connectOrCreate: continent_ids?.map((_) => {
            return {
              where: {
                property_id_continent_id: { property_id: id, continent_id: _ },
              },
              create: {
                continent: {
                  connect: {
                    id: _,
                  },
                },
              },
            };
          }),
        },
        sports: {
          connectOrCreate: sport_ids?.map((_) => {
            return {
              where: { property_id_sport_id: { property_id: id, sport_id: _ } },
              create: {
                sport: {
                  connect: {
                    id: _,
                  },
                },
              },
            };
          }),
        },
      },
    });
  }