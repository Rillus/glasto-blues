import {Link} from "@remix-run/react";
import urlHelper from "~/helpers/url";
import {DateChip} from "~/components/DateChip";
import assert from "assert";
import {ActChip} from "~/components/ActChip";
import {StageChip} from "~/components/StageChip";

export function ActGrid(props: { data: any[], options?: { showStages?: boolean } }) {
  assert(typeof props.data === 'object', 'Data must be an array')
  return (
    <div className={props.options?.showStages ? "Grid Grid--showStage" : "Grid"}>
      {props.data.map((act) => (
        <div className="Grid-row" key={act.id}>
            <ActChip name={act.name} id={act.id} />
            {props.options?.showStages && (<StageChip name={act.location.name} id={act.location.id} />)}
            <DateChip start={act.start} end={act.end} />
        </div>
      ))}
    </div>
  );
}
