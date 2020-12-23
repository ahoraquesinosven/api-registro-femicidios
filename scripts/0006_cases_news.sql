-- Table: public.news

-- DROP TABLE public.news;

CREATE TABLE public.news
(
  "id" SERIAL NOT NULL PRIMARY KEY,
  source character varying(255),
  source_url character varying(255),
  news_body text, --we will scrape the body using the url
  case_id bigint NOT NULL
    CONSTRAINT fk_cases_news
      FOREIGN KEY(case_id)
      REFERENCES cases ("id"),
  comments text
)

TABLESPACE pg_default;

ALTER TABLE public.news
    OWNER to vivas;
