import {LegacyRef, useCallback, useEffect, useState} from "react";
import { prisma } from "~/db.server";
import {Link, useFetcher, useLoaderData} from "@remix-run/react";
import {ActGrid} from "~/components/ActGrid";
import {Act} from "@prisma/client";
import {getUserId} from "~/session.server";
import {LoaderArgs} from "@remix-run/node";
import {Loader} from "~/components/Loader";

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
    orderBy: [
      {
        start: 'asc',
      },
      {
        name: 'asc'
      }
    ],
    ...(!search && {
      take: take,
      skip: ((page - 1) * take)
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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true)

  }, [clientHeight, scrollPosition]);

  // Set height of the parent container whenever acts are loaded
  const divHeight = useCallback(
    (node:any) => {
      if (node !== null && node.getBoundingClientRect()) {
        setHeight(node.getBoundingClientRect().height);
      }
    },
    [acts.length]
  );

  useEffect(() => {
    console.log('useEffect', fetcher.data);
    // Discontinue API calls if the last page has been reached
    if (fetcher.data && fetcher.data.acts.length === 0) {
      console.log('no more results')
      setShouldFetch(false);
      setIsLoading(false)
      return;
    }

    // Fetcher contains data, merge them and allow the possibility of another fetch
    if (fetcher.data && fetcher.data.acts.length > 0) {
      console.log('fetcher data', fetcher.data, data, acts)
      if(fetcher.data.replace) {
        setActs(fetcher.data.acts);
        setShouldFetch(false);
      } else {
        setActs((prevData) => [...prevData, ...fetcher.data.acts]);
        setPage((page: number) => page + 1);
        setShouldFetch(true);
      }
      setIsLoading(false)
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
          placeholder={"Search for an act. Minimum 3 characters. Searches on full words only. i.e. 'The' will not return 'Theatre'"}
          onChange={(e) => {
            if (e.target.value.length === 0) {
              if (acts.length === 0){
                setIsLoading(true)
                fetcher.load(`/acts?index`);
              }
            } else if (e.target.value.length >= 3) {
              setIsLoading(true)
              fetcher.load(`/acts?index&search=${e.target.value}`);
            } else {
              setIsLoading(false)
              setActs([]);
            }
          }}
        />
      </div>
      <ActGrid data={acts} options={{showStages: true}}></ActGrid>

      <div style={{position: 'relative', marginTop: '40px'}}>
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          {acts.length === 0 && (
            <p style={{width: "200px", textAlign: "center"}}>No acts found.</p>
          )}
          {isLoading &&
            (
                <Loader size={"100px"} />
            )
          }
        </div>
      </div>
    </div>
  );
}
