import {LegacyRef, useCallback, useEffect, useState} from "react";
import { prisma } from "~/db.server";
import {Link, useFetcher, useLoaderData} from "@remix-run/react";
import {ActGrid} from "~/components/ActGrid";
import {Act} from "@prisma/client";
import {getUserId} from "~/session.server";
import {LoaderArgs} from "@remix-run/node";

interface Args extends RequestInit{
  request: {
    url: string,
    params: {
      page: number
    }
  }
}

export const loader = async ({request}:LoaderArgs) => {
  const take = 20;
  const page = Number(new URL(request.url).searchParams.get("page") || "1");
  const search = new URL(request.url).searchParams.get("search");
  const allActs = await prisma.act.findMany({
    include: {
      location: true,
      savedAct: {
        where: {
          userId: await getUserId(request)
        }
      }
    },
    orderBy: {
      start: 'asc'
    },
    ...(!search && {
      take: take,
      skip: (page - 1) * take
    }),
    ...(search && {
      where: {
        name: {
          search: search.split(" ").join(" & ")
        }
      }
    })
  });

  return {
    acts: allActs,
    search: search,
    replace: !!search
  };
}

interface Acts {
  acts: Act[] | null
}

export default function ActsIndexRoute() {
  const initialData = useLoaderData<typeof loader>();
  const [data, setData] = useState(initialData);
  const [acts, setActs] = useState(initialData.acts);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [height, setHeight] = useState(null);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [page, setPage] = useState(2);
  const fetcher = useFetcher();

  // Add Listeners to scroll and client resize
  useEffect(() => {
    const scrollListener = () => {
      setClientHeight(window.innerHeight);
      setScrollPosition(window.scrollY);
    };

    // Avoid running during SSR
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", scrollListener);
    }

    // Clean up
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", scrollListener);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldFetch || !height) return;
    if (clientHeight + scrollPosition + 100 < height) return;
    console.log('fetching due to scroll');
    fetcher.load(`/acts?index&page=${page}`);

    setShouldFetch(false);
  }, [clientHeight, scrollPosition]);

  // Set height of the parent container whenever acts are loaded
  const divHeight = useCallback(
    (node:any) => {
      if (node !== null) {
        setHeight(node.getBoundingClientRect().height);
      }
    },
    [data.acts.length]
  );

  useEffect(() => {
    console.log('useEffect', fetcher.data);
    // Discontinue API calls if the last page has been reached
    if (fetcher.data && fetcher.data.length === 0) {
      console.log('no more results')
      setShouldFetch(false);
      return;
    }

    // Fetcher contains data, merge them and allow the possibility of another fetch
    if (fetcher.data && fetcher.data.acts.length > 0) {
      console.log('fetcher data', fetcher.data, data, acts)
      if(fetcher.data.replace) {
        setActs(fetcher.data.acts);
        setShouldFetch(false);
        return;
      } else {
        setActs((prevData) => [...prevData, ...fetcher.data.acts]);
        setPage((page: number) => page + 1);
        setShouldFetch(true);
      }
    }
  }, [fetcher.data]);

  return (
    <div ref={divHeight}>
      <div className={"Search"}>
        Search:
        <input
          className={"Input"}
          type={"text"}
          id={"actSearch"}
          placeholder={"Search for an act"}
          onChange={(e) => {
            if (e.target.value.length === 0) {
              if (acts.length === 0){
                fetcher.load(`/acts?index`);
              }
            } else if (e.target.value.length >= 3) {
              fetcher.load(`/acts?index&search=${e.target.value}`);
            } else {
              setActs([]);
            }
          }}
        />
      </div>
      <ActGrid data={acts} options={{showStages: true}}></ActGrid>
      {acts.length === 0 && (
        <p>No acts found. Please enter at least 3 characters in the search field.</p>
      )}
    </div>
  );
}
