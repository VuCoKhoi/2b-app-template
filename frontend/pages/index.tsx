import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const { data } = useSWR("/shop/my");
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <nav className="bg-white dark:bg-gray-800  ">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between h-16">
              <div className=" flex items-center">
                <div className="md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link href="/">
                      <a className="text-gray-300  hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Home
                      </a>
                    </Link>
                    <Link href="/">
                      <a className="text-gray-800 dark:text-white  hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Gallery
                      </a>
                    </Link>
                    <Link href="/">
                      <a className="text-gray-300  hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Content
                      </a>
                    </Link>
                    <Link href="/" passHref>
                      <a className="text-gray-300  hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Contact
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="block">
                <div className="ml-4 flex items-center md:ml-6"></div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Home;
