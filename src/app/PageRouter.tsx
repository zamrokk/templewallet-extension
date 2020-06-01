import * as React from "react";
import * as Woozie from "lib/woozie";
import { useThanosClient } from "lib/thanos/front";
import { useAppEnv, OpenInFullPage } from "app/env";
import Unlock from "app/pages/Unlock";
import Welcome from "app/pages/Welcome";
import ImportWallet from "app/pages/ImportWallet";
import CreateWallet from "app/pages/CreateWallet";
import CreateAccount from "app/pages/CreateAccount";
import ImportAccount from "app/pages/ImportAccount";
import Explore from "app/pages/Explore";
import Receive from "app/pages/Receive";
import Send from "app/pages/Send";
import Delegate from "app/pages/Delegate";
import Settings from "app/pages/Settings";

interface RouteContext {
  popup: boolean;
  fullPage: boolean;
  ready: boolean;
  locked: boolean;
}

type RouteFactory = Woozie.Router.ResolveResult<RouteContext>;

const ROUTE_MAP = Woozie.Router.createMap<RouteContext>([
  [
    "/import-wallet",
    (_p, ctx) => {
      switch (true) {
        case ctx.ready:
          return Woozie.Router.SKIP;

        case !ctx.fullPage:
          return <OpenInFullPage />;

        default:
          return <ImportWallet />;
      }
    },
  ],
  [
    "*",
    (_p, ctx) => {
      switch (true) {
        case ctx.locked:
          return <Unlock />;

        case !ctx.ready && !ctx.fullPage:
          return <OpenInFullPage />;

        default:
          return Woozie.Router.SKIP;
      }
    },
  ],
  ["/", (_p, ctx) => (ctx.ready ? <Explore /> : <Welcome />)],
  ["/create-wallet", onlyNotReady(() => <CreateWallet />)],
  ["/create-account", onlyReady(() => <CreateAccount />)],
  [
    "/import-account/:tabSlug?",
    onlyReady(({ tabSlug }) => <ImportAccount tabSlug={tabSlug} />),
  ],
  ["/receive", onlyReady(() => <Receive />)],
  ["/send", onlyReady(() => <Send />)],
  ["/delegate", onlyReady(() => <Delegate />)],
  [
    "/settings/:tabSlug?",
    onlyReady(({ tabSlug }) => <Settings tabSlug={tabSlug} />),
  ],
  ["*", () => <Woozie.Redirect to="/" />],
]);

const Page: React.FC = () => {
  const { trigger, pathname } = Woozie.useLocation();

  // Scroll to top after new location pushed.
  React.useLayoutEffect(() => {
    if (trigger === Woozie.HistoryAction.Push) {
      window.scrollTo(0, 0);
    }
    if (pathname === "/") {
      Woozie.resetHistoryPosition();
    }
  }, [trigger, pathname]);

  const appEnv = useAppEnv();
  const thanos = useThanosClient();

  const ctx = React.useMemo<RouteContext>(
    () => ({
      popup: appEnv.popup,
      fullPage: appEnv.fullPage,
      ready: thanos.ready,
      locked: thanos.locked,
    }),
    [appEnv.popup, appEnv.fullPage, thanos.ready, thanos.locked]
  );

  return React.useMemo(() => Woozie.Router.resolve(ROUTE_MAP, pathname, ctx), [
    pathname,
    ctx,
  ]);
};

export default Page;

function onlyReady(factory: RouteFactory): RouteFactory {
  return (params, ctx) =>
    ctx.ready ? factory(params, ctx) : Woozie.Router.SKIP;
}

function onlyNotReady(factory: RouteFactory): RouteFactory {
  return (params, ctx) =>
    ctx.ready ? Woozie.Router.SKIP : factory(params, ctx);
}
