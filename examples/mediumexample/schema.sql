CREATE TABLE "posts" (
  "id" SERIAL NOT NULL,
  "account_id" VARCHAR NOT NULL,
  "block_height" DECIMAL(58, 0) NOT NULL,
  "receipt_id" VARCHAR NOT NULL,
  "content" TEXT NOT NULL,
  "block_timestamp" DECIMAL(20, 0) NOT NULL,
  "accounts_liked" JSONB NOT NULL DEFAULT "[]",
  "likes_count" DECIMAL(20, 0) NOT NULL DEFAULT 0,
  "last_comment_timestamp" DECIMAL(20, 0) DEFAULT NULL,
  CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "posts_account_id_block_height_key" ON "posts" ("account_id" ASC, "block_height" ASC);
CREATE INDEX "posts_block_timestamp" ON "posts" ("block_timestamp" DESC);
