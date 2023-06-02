import type {LoaderArgs} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import {prisma} from "~/db.server";
import {getUserId} from "~/session.server";
import {ActGrid} from "~/components/ActGrid";
import type {Act} from "@prisma/client";

interface ActWithSaved extends Act {
  savedAct: Array<{
    id: string
  }>
}

export const loader = async ({request}: LoaderArgs) => {
  const savedActs = await prisma.savedAct.findMany({
    orderBy: {
      act: {
        start: 'asc'
      }
    },
    where: {
      userId: await getUserId(request)
    },
    include: {
      act: {
        include: {
          location: true
        }
      }
    }
  });

  const filteredSavedActs = savedActs.map((savedAct) => {
    let returnSavedAct = savedAct.act as unknown as ActWithSaved;
    returnSavedAct.savedAct= [];
    returnSavedAct.savedAct.push({
      id: savedAct.id
    });
    return returnSavedAct
  });

  return {filteredSavedActs};
}

export default function Index() {
  const user = useOptionalUser();
  const data = useLoaderData<typeof loader>();
  console.log(data);

  return (
    <main>
      {user ? (
        <div>
          {data.filteredSavedActs.length === 0 ? (
            <p>No saved acts yet. Select one of the menu links to view and add some, why don't you?
            </p>
          ) : (
            <ActGrid data={data.filteredSavedActs} options={{showStages: true}}></ActGrid>
          )}
          <p>You can also add <Link to="/notes" className="underline">
              notes
            </Link> for some reason.
          </p>
        </div>
      ) : (
        <div>
          To save acts and view your saved lineup, please sign up or log in.
          <Link
            to="/join"
            className="Button">
            Sign up
          </Link>
          <Link
            to="/login"
            className="Button">
            Log In
          </Link>
        </div>
      )}
    </main>
  );
}
