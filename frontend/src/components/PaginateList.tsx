import React, { useState } from "react";
import { Button, List, notification, Skeleton } from "antd";
import { PaginateList, ReportHistory } from "../interfaces";
import useSWR, { useSWRConfig } from "swr";
import { prefix } from "../../pages/_app";

type Props = {};

const PaginateList = (props: Props) => {
  const { mutate } = useSWRConfig();
  const [offset, setOffset] = useState(0);
  const { data } = useSWR<PaginateList<ReportHistory>>(
    `/report/histories?offset=${offset}`
  );

  const openNotification = (fileName: string) => {
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="primary"
        danger
        size="large"
        onClick={async () => {
          await fetch(`${prefix}/report/${fileName}`, {
            method: "Delete",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
            },
          });
          mutate(`/report/histories?offset=${offset}`);
          notification.close(key);
        }}
      >
        Confirm
      </Button>
    );
    notification.open({
      message: "Delete",
      description: `Are you sure that you want to delete ${fileName}.xlsx?`,
      btn,
      key,
    });
  };
  return (
    <List
      pagination={{
        position: "top",
        onChange: (page) => {
          setOffset(page - 1);
        },
        pageSize: data?.limit || 0,
        total: data?.totalDocs || 0,
        showSizeChanger: false,
      }}
      style={{ width: "100%" }}
      loading={!data}
      itemLayout="horizontal"
      dataSource={data?.docs || []}
      renderItem={(item) => {
        return (
          <List.Item
            actions={[
              <a key="list-dowload" href={`/api/statics/${item.fileName}.xlsx`}>
                Download
              </a>,
              <div
                key="list-delete"
                style={{ color: "red", cursor: "pointer" }}
                onClick={() => openNotification(item.fileName)}
              >
                Delete
              </div>,
            ]}
          >
            <Skeleton title={false} loading={!item} active>
              <List.Item.Meta
                title={
                  <div
                    style={{ wordBreak: "break-all" }}
                  >{`${item.fileName}.xlsx`}</div>
                }
                description={new Date(
                  item?.updatedAt || new Date()
                ).toLocaleString()}
              />
            </Skeleton>
          </List.Item>
        );
      }}
    />
  );
};

export default PaginateList;
