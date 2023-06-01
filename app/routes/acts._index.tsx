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
      name: 'asc'
    },
    take: take,
    skip: (page - 1) * take
  });

  return {
    acts: allActs
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
    console.log('fetching');
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
      console.log('fetecher data', fetcher.data, data, acts)
      setActs((prevData) => [...prevData, ...fetcher.data.acts]);
      setPage((page: number) => page + 1);
      setShouldFetch(true);
    }
  }, [fetcher.data]);

  return (
    <div ref={divHeight}>
      <p>Here's some acts alphabetically (pagination coming soon):</p>
      <ActGrid data={acts} options={{showStages: true}}></ActGrid>
    </div>
  );
}
