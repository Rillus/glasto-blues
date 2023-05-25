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
  params: Params<ParamParseKey<typeof PathNames.acts>>;
}

export const loader = async ({params}:Args) => {
  const nameToMatch = params.actId.replace(/-+/g, ' ');
  const actItem = await prisma.act.findMany({
    where: {
      name: {
        contains: nameToMatch
      },
    }
  });

  if (!actItem || actItem.length === 0) {
    return json({message: 'Act not found', status: 404});
  }

  return json({actItem});
};

export default function ActRoute() {
  const data = useLoaderData<typeof loader>();

  if (data.status === 404) {
    return (
      <div>
        <h1>Act not found</h1>
        <p>
          <button onClick={() => history.goBack()}>Go back</button>
        </p>
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
