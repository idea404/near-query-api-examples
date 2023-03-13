/* Not accepted because of read-only mode */
CREATE TABLE public.post_likes_timestamped (
    id serial primary key,
    account_id varchar not null,
    block_height numeric(58) not null,
    block_timestamp numeric(20) not null,
    receipt_id varchar not null,
    post_id varchar not null,
    unique (account_id, block_height)
);