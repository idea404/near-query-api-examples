CREATE TABLE "posts" (
  "id" SERIAL NOT NULL,
  "account_id" VARCHAR NOT NULL,
  "block_height" DECIMAL(58, 0) NOT NULL,
  "receipt_id" VARCHAR NOT NULL,
  "content" TEXT NOT NULL,
  "block_timestamp" DECIMAL(20, 0) NOT NULL,
  CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);
