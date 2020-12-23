-- Table: public.children

-- DROP TABLE public.children;

CREATE TABLE public.children
(
    "id" SERIAL NOT NULL PRIMARY KEY,
    first_name character varying(255),
    last_name character varying(255),
    age bigint,
  	victim_id bigint,
    CONSTRAINT fk_victim
      FOREIGN KEY(victim_id)
      REFERENCES victims ("id")
)

TABLESPACE pg_default;

ALTER TABLE public.children
    OWNER to vivas;
