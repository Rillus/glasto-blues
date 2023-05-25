import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import type {Params} from "@remix-run/react";
import { prisma } from "~/db.server";
import type {ActionFunctionArgs, ParamParseKey} from "@remix-run/router";

const PathNames = {
  acts: '/acts/:actId',
} as const;

interface Args extends ActionFunctionArgs {
  params: {
    actId: string
  };
}

export const loader = async (params:Args) => {
  console.log(params.params.actId);
  const nameToMatch = params.params.actId.replace(/-+/g, ' ');
  console.log(nameToMatch);
  const actItem = await prisma.act.findMany({
    where: {
      name: {
        contains: nameToMatch,
        mode: 'insensitive'
      },
    }
  });

  console.log(actItem);

  if (!actItem || actItem.length === 0) {
    return json({actItem: []});
  }

  return json({actItem});
};

export default function ActRoute() {
  const data = useLoaderData<typeof loader>();

  if (!data.actItem || data.actItem.length === 0) {
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
          {data.actItem[0].name}
        </Link>
      </h1>
      <p>{data.actItem[0].description}</p>
    </div>
  );
}
