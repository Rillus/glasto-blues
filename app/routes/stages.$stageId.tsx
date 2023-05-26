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
  stages: '/stages/:stageId',
} as const;

interface Args extends ActionFunctionArgs {
  params: {
    stageId: string
  }
}

export const loader = async (params:Args) => {
  console.log(params);
  assert(params, 'Stage ID is required')
  const nameToMatch = params.params.stageId.replace(/-+/g, ' ');
  console.log(nameToMatch);
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
        contains: nameToMatch,
        mode: 'insensitive'
      },
    },
  });

  // if (!stage) {
  //   return json({stage: []});
  // }
  console.log(stage);

  return json({stage});
};

export default function StageRoute() {
  const data = useLoaderData<typeof loader>();

  if (!data.stage) {
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
