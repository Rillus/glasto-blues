import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const glastoData = require('../public/g2023.json');
const prisma = new PrismaClient();

async function seed() {
  const email = "riley@ticketlab.co.uk";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("glasto-blues", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await Promise.all(
    glastoData.locations.map((location: any) => {
      const locationInDb = prisma.location.create(
        {
          data: {
            name: location.name
          }
        }
      ).then((locationInDb) => {
        console.log('locationInDb', locationInDb);
        location.events.map((locationEvent: any) => {
          if (locationEvent.name.trim() !== '') {
            const newAct = prisma.act.create(
              {
                data: {
                  name: locationEvent.name,
                  short: locationEvent.short,
                  start: new Date(locationEvent.start),
                  end: new Date(locationEvent.end),
                  locationId: locationInDb.id,
                }
              }
            ).then((newAct) => {
              console.log('newAct', newAct);
              return newAct;
            });
          }
        });
      });
      return locationInDb;
    })
  );

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
