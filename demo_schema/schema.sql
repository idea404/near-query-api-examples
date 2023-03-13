create table public.posts (
    id serial primary key,
    account_id varchar not null,
    block_height numeric(58) not null,
    content text not null,
    block_timestamp numeric(20) not null,
    receipt_id varchar not null,
    accounts_liked jsonb not null,
    unique (account_id, block_height)
);