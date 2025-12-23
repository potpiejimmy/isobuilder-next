import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (<>
      <Head>
        <title>ISO 8583 Message Builder and Parser</title>
        <meta name="description" content="ISO 8583 Message Builder and Parser" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>);
}
