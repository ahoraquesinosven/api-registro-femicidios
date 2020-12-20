-- Table: public.victims

-- DROP TABLE public.victims;

CREATE TABLE public.victims
(
    id bigint NOT NULL,
    age bigint,
    first_name character varying(255),
    last_name character varying(255),
    gender character varying(20), ---ENUM
    nationality character varying(3), --ISO3
    CONSTRAINT victims_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.victims
    OWNER to vivas;
