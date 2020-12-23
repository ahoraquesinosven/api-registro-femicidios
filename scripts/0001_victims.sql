-- Table: public.victims

-- DROP TABLE public.victims;

CREATE TABLE public.victims
(
    "id" SERIAL PRIMARY KEY NOT NULL,
    birth_year bigint, -- Frontend will ask for age and we will calculate the year
    first_name character varying(255),
    last_name character varying(255),
    gender character varying(255) NOT NULL, ---ENUM
    nationality character varying(3), --ISO3 ENUM
    comments text
)

TABLESPACE pg_default;

ALTER TABLE public.victims
    OWNER to vivas;
