-- Table: public.cases_aggressors

-- DROP TABLE public.cases_aggressors;

CREATE TABLE public.cases_aggressors
(
  "id" SERIAL NOT NULL PRIMARY KEY,
  case_id bigint NOT NULL,
  CONSTRAINT fk_cases_cases_aggressors
    FOREIGN KEY(case_id)
    REFERENCES cases ("id"),
  aggressor_id bigint NOT NULL,
  CONSTRAINT fk_aggressors_cases_aggressors
    FOREIGN KEY(aggressor_id)
    REFERENCES aggressors ("id"),
   victim_living_with_aggressor boolean,
   victim_aggressor_relationship character varying(255),---ENUM
   has_previous_complaints boolean,
   has_previous_femicides boolean,
   commit_suicide boolean,
   attempt_suicide boolean,
   belongs_to_enforcement_agency boolean,
   enforcement_agency character varying(255), --ENUM
   comments text
)

TABLESPACE pg_default;

ALTER TABLE public.cases_aggressors
    OWNER to vivas;
