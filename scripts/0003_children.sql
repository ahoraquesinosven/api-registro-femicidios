-- Table: public.children

-- DROP TABLE public.children;

CREATE TABLE public.children
(
    "id" SERIAL NOT NULL PRIMARY KEY,
    first_name character varying(255),
    last_name character varying(255),
    birth_year bigint, -- Frontend will ask for age and we will calculate the year
  	case_id bigint NOT NULL,
    CONSTRAINT fk_cases_children
      FOREIGN KEY(case_id)
      REFERENCES cases ("id"),
    comments text
)

TABLESPACE pg_default;

ALTER TABLE public.children
    OWNER to vivas;
