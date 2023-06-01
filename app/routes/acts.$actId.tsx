import {json, LoaderArgs} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import type {Params} from "@remix-run/react";
import { prisma } from "~/db.server";
import {getUserId} from "~/session.server";
export type { SavedAct } from "@prisma/client";


const PathNames = {
  acts: '/acts/:actId',
} as const;

interface ActsLoaderArgs extends LoaderArgs {
  params: {
    actId: string
  }
}

export const loader = async ({params, request}:ActsLoaderArgs) => {
  const isSelected = new URL(request.url).searchParams.get("isSelected");
  console.log('isSelected', isSelected);

  const nameToMatch = params.actId.replace(/-+/g, ' ');
  console.log('nameToMatch', nameToMatch);
  const actItem = await prisma.act.findFirst({
    where: {
      name: {
        search: nameToMatch.split(" ").join(" & ")
      },
    },
    include: {
      savedAct: {
        where: {
          userId: await getUserId(request)
        }
      }
    }
  });

  if  (!actItem) {
    console.log("Act not found");
    return json({actItem: null});
  } else {
    const userId = await getUserId(request) as string;
    const actId = actItem.id;
    if (actItem.savedAct.length === 0 && isSelected) {
      console.log("Act is not saved");
      // Add SavedAct for this act
      const savedAct = await prisma.savedAct.create({
        data: {
          userId: userId,
          actId: actId
        }
      });
      actItem.savedAct.push(savedAct);
    } else if (actItem.savedAct.length > 0 && isSelected === 'false') {
      console.log("Act is saved - remove it");
      // delete SavedAct for this act & user
      await prisma.savedAct.delete({
        where: {
          id: actItem.savedAct[0].id
        }
      });
      actItem.savedAct = [];
    }
  }

  console.log(actItem);

  return json({actItem});
};

export default function ActRoute() {
  const data = useLoaderData<typeof loader>();

  if (!data.actItem) {
    return (
      <div>
        <h1>Act not found</h1>
      </div>
    );
  }

  return (
    <div className="main">
      <h1>
        <Link to=".">
          {data.actItem.name}
        </Link>
      </h1>
      <p>{data.actItem.description}</p>
    </div>
  );
}
