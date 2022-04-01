import styles from "../styles/Home.module.scss";
import Layout from "../components/layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Input, Button, Avatar } from "antd";
import { EditOutlined, EllipsisOutlined, EyeOutlined, AreaChartOutlined } from "@ant-design/icons";
import { Skeleton, Image } from "antd";
import moment from "moment";
import { Pagination } from "antd";
import Meta from "antd/lib/card/Meta";

interface News {
  article_date: string;
  authors: Array<string>;
  headline: string;
  highlight: string;
  id: number;
  image: string;
  key_figures: Object;
  language: Object;
  publication: Object;
  sentiment: number;
  snippet: string;
  url: string;
}

interface Stats {
  total: number;
  reach: number;
  interactions: number;
}

interface NewsResponse {
  news: Array<News>;
  stats: Stats;
}

export default function Home() {
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  function loadNews(from?: number, query?: string) {
    setIsFetching(true);
    return axios
      .get(
        `https://public-api.pressrelations.de/newsradar-bff/search/sample?from=${from ?? 0}&size=10${
          query ? "&query=" + encodeURIComponent(query) : ""
        }`
      )
      .then((newsFetched: { data: NewsResponse }) => {
        console.log(newsFetched.data.news);
        setNews(newsFetched.data.news);
        setStats(newsFetched.data.stats);
      })
      .catch((error) => {
        console.log("Do something with the error....");
      })
      .finally(() => setIsFetching(false));
  }

  function onChangePagination(actualPage: number) {
    loadNews(actualPage);
  }

  function applyFiltersOnQuery(): void {
    loadNews(null, query);
  }

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <Layout>
      <div className={styles.componentMainContainer}>
        <div className="d-flex">
          <Input
            placeholder={"Enter query"}
            value={query}
            onKeyDown={(event) => (event.key == "Enter" ? applyFiltersOnQuery() : false)}
            onInput={(inputEvent) => {
              setQuery(inputEvent.target["value"]);
            }}
          />
          <Button type="primary" onClick={applyFiltersOnQuery}>
            Apply query
          </Button>
        </div>

        <Skeleton active loading={isFetching}>
          <div className={styles.newsContainer + " d-flex flex-wrap justify-content-center"}>
            {news.map((newsObject: News, index) => {
              return (
                <Card
                  className={styles.newsCardContainer + " m-3 p-3"}
                  key={index}
                  cover={
                    <div style={{ overflow: "hidden" }}>
                      <Image
                        key={index}
                        src={newsObject?.image || "error"}
                        fallback={"/vercel.svg"}
                        alt={newsObject.headline}
                        className={styles.newsImage}
                        height={180}
                        width={300}
                        preview={false}
                      />
                      <h5 className="ellipsis title">{newsObject.headline}</h5>
                      <p className="ellipsis description">{newsObject.snippet}</p>
                    </div>
                  }
                  actions={[<EyeOutlined />, <EditOutlined key="edit" />, <EllipsisOutlined key="ellipsis" />]}
                >
                  <Meta
                    key={index}
                    avatar={<Avatar src={newsObject.publication["logo_url"]} />}
                    title={newsObject.publication["name"]}
                    description={
                      <div className="d-flex align-items-center" style={{ gap: "5px" }}>
                        <AreaChartOutlined />
                        <span className="ellipsis">
                          <strong>{newsObject.publication["visits"]}</strong> {"visits "}
                        </span>
                        <span className="ellipsis">
                          <strong>{newsObject.key_figures["reach"]}</strong> reach score
                        </span>
                      </div>
                    }
                  />
                  <p style={{ textAlign: "right" }} className="text-secondary">
                    {moment(newsObject.article_date).format("DD/MM/YYYY HH:mm").toString()}
                  </p>
                </Card>
              );
            })}
          </div>
        </Skeleton>
        <div className="d-flex justify-content-center">
          <Pagination defaultCurrent={1} total={stats?.total ?? 1} onChange={onChangePagination} />
        </div>
      </div>
    </Layout>
  );
}
