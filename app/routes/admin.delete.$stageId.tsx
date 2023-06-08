import {useLoaderData} from "@remix-run/react";
import {prisma} from "~/db.server";

import type { Location } from "@prisma/client";
import type { Act } from "@prisma/client";
import {json, LoaderArgs} from "@remix-run/node";

interface DeleteStageLoaderArgs extends LoaderArgs {
  params: {
    stageId: string
  }
}

export const loader = async ({params, request}:DeleteStageLoaderArgs) => {
  // delete stage by id
  let stage = {}

  try {
    stage = await prisma.location.delete({
      where: {
        id: parseInt(params.stageId)
      }
    });
  } catch {
    stage = {
      name: 'No record found'
    }
  }

  return json({stage});
}

export default function AdminDeleteStageId() {
  const data = useLoaderData();

  return (
    <div>
      <h1>Deleted: {data.stage.name}</h1>
    </div>
  );
}
