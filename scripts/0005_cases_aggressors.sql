-- Table: public.cases

-- DROP TABLE public.cases;

CREATE TABLE public.cases
(
    case_id bigint REFERENCES cases ("id"),
    aggressor_id bigint REFERENCES aggressors ("id")
)

TABLESPACE pg_default;

ALTER TABLE public.cases
    OWNER to vivas;
