import type {ActionArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, useActionData} from "@remix-run/react";
import {useEffect, useRef} from "react";
import {requireUserId} from "~/session.server";
import {useOptionalUser} from "~/utils";
import {prisma} from "~/db.server";

import type { Location } from "@prisma/client";
import type { Act } from "@prisma/client";

interface GlastoAct {
  location: GlastoLocation;
  start: Date;
  end: Date;
  name: string;
  short: string;
  id: string;
}

interface GlastoLocation {
  id: number;
  events?: Array<GlastoAct>;
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();;
  const body = formData.get("body");

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { body: "JSON is required", title: null } },
      { status: 400 }
    );
  }

  const savedActs = await prisma.act.findMany();
  const savedStages = await prisma.location.findMany();

  function saveAct(location:GlastoLocation, locationInDb:GlastoLocation) {
    if (!location.events) {
      return;
    }
    // Make sure act doesn't exist in savedActs
    location.events.map((locationEvent: GlastoAct) => {
      const savedAct = savedActs.find((savedAct) => {
        return savedAct.short === locationEvent.short;
      });
      if (!savedAct) {
        if (locationEvent.name.trim() !== '') {
          prisma.act.create(
            {
              data: {
                name: locationEvent.name,
                short: locationEvent.short,
                start: new Date(locationEvent.start),
                end: new Date(locationEvent.end),
                locationId: locationInDb.id,
              }
            }
          ).then((newAct) => {
            console.log('newAct', newAct);
            return newAct;
          });
        }
      }
    });
  }

  try {
    const jsonData = JSON.parse(body);

    const done = await Promise.all(
      jsonData.locations.map((location: any) => {
        // make sure location isn't in savedStages
        const savedStage = savedStages.find((savedStage) => {
          return savedStage.name === location.name;
        });

        if (!savedStage) {
          return prisma.location.create({
            data: {
              name: location.name
            }
          }).then((locationInDb) => {
            console.log('locationInDb', locationInDb);
            return saveAct(location, locationInDb);
          });
        } else {
          return saveAct(location, savedStage);
        }
      })
    );

    // TODO: log how many updates have been made by a given change

    return redirect(`/stages`);
  } catch (err) {
    return json(
      { errors: { body: "JSON is invalid" } },
      { status: 400 }
    );
  }

  // const note = await createNote({ body });

};

export default function AdminPage() {
  const actionData = useActionData<typeof action>();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const user = useOptionalUser();

  useEffect(() => {
    if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      {user && user.email === "riley@ticketlab.co.uk" ? (
        <Form
          method="post"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          <div>
            <label className="flex w-full flex-col gap-1">
              <span>g2023 JSON: </span>
              <textarea
                ref={bodyRef}
                name="body"
                rows={8}
                className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6 text-blue-700"
                aria-invalid={actionData?.errors?.body ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.body ? "body-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.body ? (
              <div className="pt-1 text-red-700" id="body-error">
                {actionData.errors.body}
              </div>
            ) : null}
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Update Lineup
            </button>
          </div>
        </Form>
      ) : (
        <p>Logged in admin only</p>
      )}
    </div>
  );
}
