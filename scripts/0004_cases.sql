-- Table: public.cases

-- DROP TABLE public.cases;

CREATE TABLE public.cases
(
    "id" SERIAL NOT NULL PRIMARY KEY,
    city character varying(255),
    province character varying(255), --ENUM
    victim_id bigint REFERENCES victims ("id"),
)

TABLESPACE pg_default;

ALTER TABLE public.cases
    OWNER to vivas;