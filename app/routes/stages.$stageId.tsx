import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import type {Params} from "@remix-run/react";
import { prisma } from "~/db.server";
import type {ActionFunctionArgs, ParamParseKey} from "@remix-run/router";
import {StageChip} from "~/components/StageChip";
import {ActGrid} from "~/components/ActGrid";
import {getUserId} from "~/session.server";
import {useOptionalUser} from "~/utils";

const PathNames = {
  stages: '/stages/:stageId',
} as const;

interface Args {
  params: {
    stageId: string
  }
}

interface StagesLoaderArgs extends LoaderArgs {
  params: {
    stageId: string
  }
}

export const loader = async ({params, request}:StagesLoaderArgs) => {
  console.log(request);
  const nameToMatch = params.stageId.replace(/-+/g, ' ');
  console.log(nameToMatch);
  const stage = await prisma.location.findFirst({
    include: {
      Act: {
        orderBy: {
          start: 'asc'
        },
        include: {
          savedAct: {
            where: {
              userId: await getUserId(request)
            }
          }
        }
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

  return json({stage});
};

export default function StageRoute() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

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
        {user && user.email === "riley@ticketlab.co.uk" ? (
          <small>&nbsp;<small><small><a href={`/admin/delete/${data.stage.id}`}>Delete </a></small></small></small>
        ) : null}
      </h1>
      <p>{data.stage.description}</p>
      <ActGrid data={data.stage.Act}/>
    </div>
  );
}
