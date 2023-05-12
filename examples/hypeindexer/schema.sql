CREATE TABLE "posts" (
  "id" TEXT NOT NULL,
  "account_id" VARCHAR NOT NULL,
  "block_height" DECIMAL(58, 0) NOT NULL,
  "block_timestamp" DECIMAL(20, 0) NOT NULL,
  "receipt_id" VARCHAR NOT NULL,
  "content" TEXT NOT NULL,
  CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comments" (
  "id" SERIAL NOT NULL,
  "post_id" TEXT NOT NULL,
  "account_id" VARCHAR NOT NULL,
  "block_height" DECIMAL(58, 0) NOT NULL,
  "block_timestamp" DECIMAL(20, 0) NOT NULL,
  "receipt_id" VARCHAR NOT NULL,
  "content" TEXT NOT NULL,
  CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);
