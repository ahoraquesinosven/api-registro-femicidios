-- Table: public.cases_aggressors

-- DROP TABLE public.cases_aggressors;

CREATE TABLE public.cases_aggressors
(
    case_id bigint,
    CONSTRAINT fk_case
      FOREIGN KEY(case_id)
      REFERENCES cases ("id"),
    aggressor_id bigint,
    CONSTRAINT fk_aggressor
      FOREIGN KEY(aggressor_id)
      REFERENCES aggressors ("id")
)

TABLESPACE pg_default;

ALTER TABLE public.cases_aggressors
    OWNER to vivas;
