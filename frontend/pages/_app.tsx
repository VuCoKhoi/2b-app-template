import "antd/dist/antd.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";

export const prefix = "/api";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        fetcher: (resource, init) =>
          fetch(`${prefix}${resource}`, {
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
            },
            ...init,
          }).then((res) => res.json()),
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
