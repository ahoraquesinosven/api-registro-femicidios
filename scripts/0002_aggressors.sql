-- Table: public.aggresors

-- DROP TABLE public.aggresors;

CREATE TABLE public.aggresors
(
    "id" SERIAL NOT NULL PRIMARY KEY,
    first_name character varying(255),
    last_name character varying(255),
    age bigint
)

TABLESPACE pg_default;

ALTER TABLE public.aggressors
    OWNER to vivas;
