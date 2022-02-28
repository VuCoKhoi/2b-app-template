import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import PaginateList from "../src/components/PaginateList";

import { Button } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import { prefix } from "./_app";
import { DiskInfo } from "../src/interfaces";

const Home: NextPage = () => {
  // const { data: shop } = useSWR("/shop/my");
  const { data: disk } = useSWR<DiskInfo>("/public/disk");
  const { mutate } = useSWRConfig();

  return (
    <div>
      <Head>
        <title>Avara Report App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <nav className="bg-white dark:bg-gray-800  ">
          <div className="mx-auto px-8  max-w-2xl">
            <div className="flex items-center justify-between h-10"></div>
            <div className="flex justify-center md:block">
              <Button
                onClick={async () => {
                  await fetch(`${prefix}/report`, {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  mutate("/report/histories");
                }}
                shape="round"
                icon={<DownloadOutlined />}
                size="large"
                className="mt-2"
              >
                Export now
              </Button>
              {/* <Button
                className="ml-4 mt-2"
                shape="round"
                size="large"
                type="primary"
                danger
                icon={<DeleteOutlined />}
              >
                Delete all report
              </Button> */}
            </div>
            <div className="mt-4 mb-4 italic block">
              Report is generated daily at midnight (tzOffset -06:00)
            </div>
            <div className="mt-4 mb-4 italic block">
              Free/Disk space: {disk?.free} / {disk?.size}
            </div>
            <div className="block m-auto">
              <div className="flex items-center">
                <PaginateList />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Home;
