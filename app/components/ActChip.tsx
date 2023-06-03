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
    setSelectedIcon(
      (<svg version="1.1" id="L5" x="0px" y="0px" viewBox="-20 0 100 100" style={{width: "20px", height: "20px"}} enableBackground="new 0 0 0 0">
        <circle fill="#fff" stroke="none" cx="6" cy="50" r="6">
          <animateTransform attributeName="transform" dur="1s" type="translate" values="0 15 ; 0 -15; 0 15" repeatCount="indefinite" begin="0.1"></animateTransform>
        </circle>
        <circle fill="#fff" stroke="none" cx="30" cy="50" r="6">
          <animateTransform attributeName="transform" dur="1s" type="translate" values="0 10 ; 0 -10; 0 10" repeatCount="indefinite" begin="0.2"></animateTransform>
        </circle>
        <circle fill="#fff" stroke="none" cx="54" cy="50" r="6">
          <animateTransform attributeName="transform" dur="1s" type="translate" values="0 5 ; 0 -5; 0 5" repeatCount="indefinite" begin="0.3"></animateTransform>
        </circle>
      </svg>)
    )
    return;
  }

  useEffect(() => {
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
