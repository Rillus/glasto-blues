import {json, LoaderArgs} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import type {Params} from "@remix-run/react";
import { prisma } from "~/db.server";
import {getUserId} from "~/session.server";
import {ActGrid} from "~/components/ActGrid";
import {useState} from "react";
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
  const actId = new URL(request.url).searchParams.get("actId");
  console.log('isSelected', isSelected);

  const nameToMatch = params.actId.replace(/-+/g, ' ');
  console.log('nameToMatch', nameToMatch);
  const actItem = await prisma.act.findMany({
    where: {
      ...(actId && {id: actId}),
      name: {
        search: nameToMatch.split(" ").join(" & ")
      },

    },
    orderBy: {
      start: 'asc'
    },
    include: {
      location: true,
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
    const actId = actItem[0].id;
    if (actItem[0].savedAct.length === 0 && isSelected === 'true') {
      console.log("Act is not saved");
      // Add SavedAct for this act
      const savedAct = await prisma.savedAct.create({
        data: {
          userId: userId,
          actId: actId
        }
      });
      actItem[0].savedAct.push(savedAct);
    } else if (actItem[0].savedAct.length > 0 && isSelected === 'false') {
      console.log("Act is saved - remove it");
      // delete SavedAct for this act & user
      await prisma.savedAct.delete({
        where: {
          id: actItem[0].savedAct[0].id
        }
      });
      actItem[0].savedAct = [];
    }
  }

  console.log(actItem);

  return json({actItem: actItem[0], actItems: actItem});
};

export default function ActRoute() {
  const data = useLoaderData<typeof loader>();
  const [actGridOptions] = useState({showStages: true});

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
      <ActGrid data={data.actItems} options={actGridOptions}></ActGrid>
    </div>
  );
}
