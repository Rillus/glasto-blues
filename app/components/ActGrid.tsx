import {DateChip} from "~/components/DateChip";
import {ActChip} from "~/components/ActChip";
import {StageChip} from "~/components/StageChip";

export function ActGrid(props: { data: Array<any>, options?: { showStages?: boolean } }) {
  return (
    <div className={props.options?.showStages ? "Grid Grid--showStage" : "Grid"}>
      {props.data.map((act) => (
        <div className="Grid-row" key={act.id}>
            <ActChip name={act.name} id={act.id} isSelected={act.savedAct?.length > 0} />
            {props.options?.showStages && (<StageChip name={act.location.name} id={act.location.id} />)}
            <DateChip start={act.start} end={act.end} />
        </div>
      ))}
    </div>
  );
}
