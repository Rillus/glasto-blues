import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta, NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { getUser } from "~/session.server";
import tailwind from "~/tailwind.css";
import glastoStyles from "~/styles/index.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
  { rel: "stylesheet", href: glastoStyles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export function meta(): ({ title: string } | { description: string })[] {
  const year = new Date().getFullYear();
  return [
    {
      title: "Glasto " + year
    },
    {
      description: "Your guide to who's playing at the " + year + " Glastonbury Festival.",
    }
  ];
}

export const loader = async ({ request }: LoaderArgs) => {
  return json({ user: await getUser(request) });
};

export default function App() {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={'dark'}>
        <header className="Header">
          <h3>
            <Link to={'/'}>
              Glasto {year}
            </Link>
          </h3>
          <ul className="Nav">
            <li>
              <NavLink
                className={({ isActive, isPending }) =>
                  isPending ? "isPending" : isActive ? "isActive" : ""
                }
                to={'acts'}
              >
                Acts
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive, isPending }) =>
                  isPending ? "isPending" : isActive ? "isActive" : ""
                }
                to={'stages'}
              >
                Stages
              </NavLink>
            </li>
          </ul>
        </header>
        <section className="Main">
          <Outlet />
        </section>
        <LiveReload />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
