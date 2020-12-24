-- Table: public.cases

-- DROP TABLE public.cases;

CREATE TABLE public.cases
(
    "id" SERIAL NOT NULL PRIMARY KEY,
    occurred_at date NOT NULL,
    city character varying(255),
    province character varying(255) NOT NULL, --ENUM
    victim_id bigint NOT NULL,
    CONSTRAINT fk_victims_cases
      FOREIGN KEY(victim_id)
      REFERENCES victims ("id"),
    place_of_occurrence character varying(255), ---ENUM
    murder_way character varying(255), ---ENUM
    classification character varying(255), ---ENUM
    in_prostitution_situation boolean,
    missing boolean,
    pregnant boolean,
    made_a_complaint  boolean,
    complaints_amount bigint,
    had_judicial_measure boolean,
    judicial_measures character varying(255),
    raped boolean,
    abused boolean,
    had_children boolean,
    comments text
)

TABLESPACE pg_default;

ALTER TABLE public.cases
    OWNER to vivas;
