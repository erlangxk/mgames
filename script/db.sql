-- Table: public.bets
-- DROP TABLE public.bets;

CREATE TABLE public.bets
(
    bet_id bigint NOT NULL DEFAULT nextval('bets_bet_id_seq'::regclass),
    user_id bigint,
    draw_id bigint,
    bets_json json,
    bet_time bigint,
    create_time bigint,
    amount numeric(18,4),
    CONSTRAINT bets_pkey PRIMARY KEY (bet_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.bets
    OWNER to postgres;