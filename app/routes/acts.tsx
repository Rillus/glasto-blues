import {Outlet} from "@remix-run/react";

export default function ActsRoute() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
