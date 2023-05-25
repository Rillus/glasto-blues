import { prisma } from "~/db.server";
import {Link, useLoaderData} from "@remix-run/react";
import {DateChip} from "~/components/DateChip";
import {StageChip} from "~/components/StageChip";
import {ActGrid} from "~/components/ActGrid";
import urlHelper from "~/helpers/url";

export const loader = async () => {
  // const count = await prisma.act.count();
  // const randomRowNumber = Math.floor(Math.random() * count);
  // const randomAct = await prisma.act.findMany({
  //   skip: randomRowNumber,
  //   take: 5,
  //   include: {
  //     location: true
  //   }
  // });

  const allActs = await prisma.act.findMany({
    include: {
      location: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return {
    // randomAct: randomAct,
    acts: allActs
  };
}

export default function ActsIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {/*<p>Here's a selection of random acts you may not have seen:</p>*/}
      {/*<ActGrid data={data.randomAct}></ActGrid>*/}

      <p>Here's some acts alphabetically (pagination coming soon):</p>
      <ActGrid data={data.acts} options={{showStages: true}}></ActGrid>
    </div>
  );
}
