import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionArgs) => {
  // const form = await request.formData();
  // const description = form.get("description");
  // const name = form.get("name");
  // const short = "";
  // const start = "";
  // const end = "";
  // const location = 0;
  // // we do this type check to be extra sure and to make TypeScript happy
  // // we'll explore validation next!
  // if (
  //   typeof description !== "string" ||
  //   typeof name !== "string"
  // ) {
  //   throw new Error("Form not submitted correctly.");
  // }
  //
  // const fields = { description, name, short, start, end, location};
  //
  // const act = await prisma.act.create({ data: fields });
  // return redirect(`/acts/${act.short}`);
};

export default function NewActRoute() {
  return (
    <div>
      <p>Add your act</p>
      <form method="post">
        <div>
          <label>
            Name: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name="description" />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
