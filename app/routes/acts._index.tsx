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
  const selectedDay = new URL(request.url).searchParams.get("day");

  interface dayNames {
    [key: string]: {
      start: Date,
      end: Date
    }
  }

  const dayTimes = {
    wed: {
      start: new Date('2023-06-21T00:00:00.000Z'),
      end: new Date('2023-06-22T05:00:00.000Z')
    },
    thu: {
      start: new Date('2023-06-22T00:00:00.000Z'),
      end: new Date('2023-06-23T05:00:00.000Z')
    },
    fri: {
      start: new Date('2023-06-23T00:00:00.000Z'),
      end: new Date('2023-06-24T05:00:00.000Z')
    },
    sat: {
      start: new Date('2023-06-24T00:00:00.000Z'),
      end: new Date('2023-06-25T05:00:00.000Z')
    },
    sun: {
      start: new Date('2023-06-25T00:00:00.000Z'),
      end: new Date('2023-06-26T05:00:00.000Z')
    },
    mon: {
      start: new Date('2023-06-26T00:00:00.000Z'),
      end: new Date('2023-06-26T12:00:00.000Z')
    }
  };
  // for each dayTimes, check if the current time is between start and end

  let start = dayTimes['wed'].start;
  let end = dayTimes['wed'].end;

  if (selectedDay) {
    Object.keys(dayTimes).forEach((day:keyof dayNames) => {
      console.log(day, typeof day)
      if (selectedDay === day) {
        start = dayTimes[day as keyof typeof dayTimes].start;
        end = dayTimes[day as keyof typeof dayTimes].end;
      }
    })
  }

  console.log('selectedDay', selectedDay, start, end);
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
    }),
    where: {
      start: {
        gte: start,
        lt: end
      }
    }
  });

  return {
    acts: allActs,
    search: search,
    replace: !!search || page === 1,
    page: page,
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
  const [page, setPage] = useState(initialData.page+1);
  const fetcher = useFetcher();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('wed');

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
    fetcher.load(`/acts?index&page=${page}&day=${selectedDay}`);
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
      if(fetcher.data.search) {
        setShouldFetch(false);
      } else {
        setShouldFetch(true);
      }
      if(fetcher.data.replace) {
        setActs(fetcher.data.acts);
        setPage(2);
      } else {
        setActs((prevData) => [...prevData, ...fetcher.data.acts]);
        setPage((page: number) => page + 1);
      }
      setIsLoading(false)
    }
  }, [fetcher.data]);

  function isDaySelected(day: string) {
    console.log('isDaySelected', selectedDay, day, selectedDay.includes(day))
    if (selectedDay.includes(day)) {
      return true;
    }
    return "";
  }

  function toggleDay(day: string) {
    console.log('toggleDay', day);
    let newSelectedDays = [];
    if (selectedDay === day) {
      setSelectedDay(day);
    } else {
      setSelectedDay(day);
    }
    setIsLoading(true)
    fetcher.load(`/acts?index&day=${day}`);
  }

  function DaySelector() {

    useEffect(() => {
      if (selectedDay.length === 0) return;
      // fetcher.load(`/acts?index&days=${selectedDay}`);
    }, [selectedDay])

    const days = ['wed', 'thu', 'fri', 'sat', 'sun', 'mon'];
    let dayClass = (day: string) => {
      let daySelectorClass = 'Button DateChip-day DateChip-day--';
      daySelectorClass += day;
      if (selectedDay === day) {
        daySelectorClass += ' isActive';
      } else {
        daySelectorClass += ' isInactive';
      }

      return daySelectorClass;
    }
    return (
      <div className={"ButtonGroup"}>
        {days.map((day) => (
          <button
            className={dayClass(day)}
            key={day}
            onClick={() => toggleDay(day)}>
            {day}
          </button>
        ))}
      </div>
    )
  }

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

        <DaySelector />

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
