import { Block } from "@near-lake/primitives";

async function getBlock(block: Block, context) {
  function base64decode(encodedValue) {
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }

  const SOCIAL_DB = "social.near";

  const nearSocialPosts = block
    .actions()
    .filter((action) => action.receiverId === SOCIAL_DB)
    .flatMap((action) =>
      action.operations
        .map((operation) => operation["FunctionCall"])
        .filter((operation) => operation?.method_name === "set")
        .map((functionCallOperation) => ({
          ...functionCallOperation,
          args: base64decode(functionCallOperation.args),
          receiptId: action.receiptId,
        }))
        .filter((functionCall) => {
          const accountId = Object.keys(functionCall.args.data)[0];
          return Object.keys(functionCall.args.data[accountId]).includes("post") || Object.keys(functionCall.args.data[accountId]).includes("index");
        })
    );

  if (nearSocialPosts.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    await Promise.all(
      nearSocialPosts.map(async (postAction) => {
        const accountId = Object.keys(postAction.args.data)[0];
        console.log(`ACCOUNT_ID: ${accountId}`);

        // create a post if indeed a post
        if (postAction.args.data[accountId].post && Object.keys(postAction.args.data[accountId].post).includes("main")) {
          try {
            console.log("Creating a post...");
            const mutationData = {
              post: {
                account_id: accountId,
                block_height: blockHeight,
                block_timestamp: blockTimestamp,
                receipt_id: postAction.receiptId,
                content: postAction.args.data[accountId].post.main,
              },
            };
            await context.graphql(`
              mutation CreatePost($post: PostInput!) {
                insert_somepublicaddress_near_postsexample_posts_one(
                  object: $post
                ) {
                  account_id
                  block_height
                }
              }`,
              mutationData
            );
            console.log(`Post by ${accountId} has been added to the database`);
          } catch (e) {
            console.error(`Error creating a post by ${accountId}: ${e}`);
          }
        }
      })
    );
  }
}
