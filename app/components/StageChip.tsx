import {Link} from "@remix-run/react";
import urlHelper from "~/helpers/url";
import assert from "assert";

export function StageChip(props: { name: string, id: number }) {
  assert(props, 'Props must be an object')
  assert(props.name, 'Name must be a string')
  return (
    <span className="StageChip">
      <Link className={"StageChip-name StageChip-name--"+props.id} to={'/stages/'+urlHelper.safeName(props.name)}>{props.name}</Link>
    </span>
  );
}
