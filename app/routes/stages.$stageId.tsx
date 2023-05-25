import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import type {Params} from "@remix-run/react";
import { prisma } from "~/db.server";
import type {ActionFunctionArgs, ParamParseKey} from "@remix-run/router";
import {StageChip} from "~/components/StageChip";
import {ActGrid} from "~/components/ActGrid";
import assert from "assert";

const PathNames = {
  acts: '/acts/:stageId',
} as const;

interface Args extends ActionFunctionArgs {
  params: Params<ParamParseKey<typeof PathNames.acts>>;
}

export const loader = async ({params}:Args) => {
  assert(params.stageId, 'Stage ID is required')
  const nameToMatch = params.stageId.replace(/-+/g, ' ');
  const stage = await prisma.location.findFirst({
    include: {
      Act: {
        orderBy: {
          start: 'asc'
        },
      },
    },
    where: {
      name: {
        contains: nameToMatch
      },
    },
  });

  if (!stage) {
    return json({message: 'Stage not found', status: 404});
  }
  console.log(stage);

  return json({stage});
};

export default function StageRoute() {
  const data = useLoaderData<typeof loader>();

  if (data.status === 404) {
    return (
      <div>
        <h1>Stage not found</h1>
      </div>
    );
  }

  return (
    <div className="main">
      <h1 className="u-text-center">
        <StageChip name={data.stage.name} id={data.stage.id} />
      </h1>
      <p>{data.stage.description}</p>
      <ActGrid data={data.stage.Act}/>
    </div>
  );
}
