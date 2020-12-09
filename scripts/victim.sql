-- Table: public.victims

-- DROP TABLE public.victims;

CREATE TABLE public.victims
(
    id bigint NOT NULL,
    age bigint,
    first_name character varying(255) COLLATE pg_catalog."default",
    last_name character varying(255) COLLATE pg_catalog."default",
    gender character varying(20) COLLATE pg_catalog."default",
    nationality character varying(3) COLLATE pg_catalog."default",
    CONSTRAINT victims_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.victims
    OWNER to vivas;
