-- Table: public.aggresors

-- DROP TABLE public.aggresors;

CREATE TABLE public.aggressors
(
    "id" SERIAL NOT NULL PRIMARY KEY,
    first_name character varying(255),
    last_name character varying(255),
    birth_year bigint, -- Frontend will ask for age and we will calculate the year  
    comments text
)

TABLESPACE pg_default;

ALTER TABLE public.aggressors
    OWNER to vivas;
