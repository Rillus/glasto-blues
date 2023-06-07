import {useLoaderData} from "@remix-run/react";
import {prisma} from "~/db.server";

import type { Location } from "@prisma/client";
import type { Act } from "@prisma/client";
import {json} from "@remix-run/node";

//loader

export const loader = async ({params, request}:ActsLoaderArgs) => {
  // delete stage by id
  console.log(params.actId)
  let act = {}

  try {
    act = await prisma.act.delete({
      where: {
        id: params.actId
      }
    });
  } catch {
    act = {
      name: 'No record found'
    }
  }

  return json({act});
}

export default function AdminDeleteActById() {
  const data = useLoaderData();

  return (
    <div>
      <h1>Deleted: {data.act.name}</h1>
    </div>
  );
}
