CREATE TABLE
  "posts" (
    "id" SERIAL NOT NULL,
    "account_id" VARCHAR NOT NULL,
    "block_height" DECIMAL(58, 0) NOT NULL,
    "receipt_id" VARCHAR NOT NULL,
    "content" TEXT NOT NULL,
    "block_timestamp" DECIMAL(20, 0) NOT NULL,
    "accounts_liked" JSONB NOT NULL DEFAULT "[]",
    "likes_count" DECIMAL(20, 0) NOT NULL DEFAULT 0,
    "last_comment_timestamp" DECIMAL(20, 0),
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
  );

CREATE TABLE
  "comments" (
    "id" SERIAL NOT NULL,
    "post_id" SERIAL NOT NULL,
    "account_id" VARCHAR NOT NULL,
    "block_height" DECIMAL(58, 0) NOT NULL,
    "content" TEXT NOT NULL,
    "block_timestamp" DECIMAL(20, 0) NOT NULL,
    "receipt_id" VARCHAR NOT NULL,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
  );

CREATE TABLE
  "post_likes" (
    "post_id" SERIAL NOT NULL,
    "account_id" VARCHAR NOT NULL,
    "block_height" DECIMAL(58, 0),
    "block_timestamp" DECIMAL(20, 0) NOT NULL,
    "receipt_id" VARCHAR NOT NULL,
    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "account_id")
  );

CREATE UNIQUE INDEX "posts_account_id_block_height_key" ON "posts" ("account_id" ASC, "block_height" ASC);

CREATE UNIQUE INDEX "comments_post_id_account_id_block_height_key" ON "comments" (
  "post_id" ASC,
  "account_id" ASC,
  "block_height" ASC
);

CREATE INDEX
  "posts_block_timestamp" ON "posts" ("block_timestamp" DESC);

ALTER TABLE
  "comments"
ADD
  CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE
  "post_likes"
ADD
  CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;