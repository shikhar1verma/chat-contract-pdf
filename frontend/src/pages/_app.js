import '@/styles/globals.css';
import Layout from "@/components/Layout";
import { ThemeProvider } from 'next-themes';
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Document AI Chat</title>
        <meta name="description" content="Chat with your documents" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}