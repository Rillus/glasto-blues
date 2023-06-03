import {Link, useFetcher} from "@remix-run/react";
import urlHelper from "~/helpers/url";
import {useEffect, useState} from "react";
import {useOptionalUser} from "~/utils";

export function ActChip(props: { name: string, id: string, isSelected: boolean }) {
  const fetcher = useFetcher();
  const [isSelected, setIsSelected] = useState(props.isSelected);
  const [selectedIcon, setSelectedIcon] = useState(props.isSelected ? (<>&#9733;</>) : (<>&#9734;</>));
  const user = useOptionalUser();

  function addToLineup() {
    console.log('add to lineup', props.id, props.name, isSelected);
    fetcher.load(`/acts/${urlHelper.safeName(props.name)}?isSelected=${!isSelected}&actId=${props.id}`);
    return;
  }

  useEffect(() => {
    console.log('useEffect', fetcher.data, fetcher.data?.actItem, fetcher.data?.actItem.savedAct.length > 0);
    // Discontinue API calls if the last page has been reached
    if (fetcher.data && fetcher.data?.length === 0) {
      console.log('no results');
      return;
    }

    // Fetcher contains data, merge them and allow the possibility of another fetch
    if (fetcher.data && fetcher.data.actItem) {
      let newSelectedState = fetcher.data.actItem.savedAct?.length > 0
      console.log('Update isSelected. Oldval:', isSelected, 'Newval:', fetcher.data.actItem.savedAct?.length > 0, 'selectedIcon:', selectedIcon);
      setIsSelected((prevState:boolean) => newSelectedState);
      setSelectedIcon(newSelectedState ? (<>&#9733;</>) : (<>&#9734;</>));
    }
  }, [fetcher.data]);


  return (
    <span className="ActChip">
      {user && (
        <button className="ActChip-button" aria-label="Add to lineup" onClick={addToLineup}>
          {selectedIcon}
        </button>
      )}
      <Link to={`/acts/${urlHelper.safeName(props.name)}`}>{props.name}</Link>
    </span>
  );
}
