import {Link} from "@remix-run/react";
import urlHelper from "~/helpers/url";

export function ActChip(props: { name: string, id?: string }) {
  return (
    <span className="ActChip">
      <Link to={`/acts/${urlHelper.safeName(props.name)}`}>{props.name}</Link>
    </span>
  );
}
