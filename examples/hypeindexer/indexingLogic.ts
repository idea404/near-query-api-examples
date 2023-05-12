import { Block } from "@near-lake/primitives";

async function getBlock(block: Block, context) {
  const SOCIAL_DB = "social.near";

  function base64decode(encodedValue) {
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }

  function get_near_social_posts_comments(block_type = block, DB = SOCIAL_DB, decodeFunction = base64decode) {
    const nearSocialPostsComments = block_type
      .actions()
      .filter((action) => action.receiverId === DB)
      .flatMap((action) =>
        action.operations
          .map((operation) => operation["FunctionCall"])
          .filter((operation) => operation?.methodName === "set")
          .map((functionCallOperation) => ({
            ...functionCallOperation,
            args: decodeFunction(functionCallOperation.args),
            receiptId: action.receiptId, // providing receiptId as we need it
          }))
          .filter((functionCall) => {
            const accountId = Object.keys(functionCall.args.data)[0];
            return Object.keys(functionCall.args.data[accountId]).includes("post") || Object.keys(functionCall.args.data[accountId]).includes("index");
          })
      );
    return nearSocialPostsComments;
  }

  const nearSocialPostsComments = get_near_social_posts_comments();

  if (nearSocialPostsComments.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    await Promise.all(
      nearSocialPostsComments.map(async (postAction) => {
        const accountId = Object.keys(postAction.args.data)[0];
        console.log(`ACCOUNT_ID: ${accountId}`);

        const isPost = postAction.args.data[accountId].post && Object.keys(postAction.args.data[accountId].post).includes("main");
        const isComment = postAction.args.data[accountId].post && Object.keys(postAction.args.data[accountId].post).includes("comment");

        if (isPost) {
          const isHypePost = postAction.args.data[accountId].post.main.includes("PEPE") || postAction.args.data[accountId].post.main.includes("DOGE");
          if (!isHypePost) {
            return;
          }
          console.log("Creating a post...");
          const postId = `${accountId}:${blockHeight}`;
          await createPost(postId, accountId, blockHeight, blockTimestamp, postAction.receiptId, postAction.args.data[accountId].post.main);
        }
        if (isComment) {
          const isHypeComment = postAction.args.data[accountId].post.comment.includes("PEPE") || postAction.args.data[accountId].post.comment.includes("DOGE");
          if (!isHypeComment) {
            return;
          }
          console.log("Creating a comment...");
          const postBlockHeight = postAction.args.data[accountId].post.blockHeight;
          const postId = `${accountId}:${postBlockHeight}`;
          await createComment(accountId, postId, blockHeight, blockTimestamp, postAction.receiptId, postAction.args.data[accountId].post.comment);
        }
      })
    );
  }

  async function createPost(postId, accountId, blockHeight, blockTimestamp, receiptId, postContent) {
    try {
      const postObject = {
        post: {
          id: postId,
          account_id: accountId,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: receiptId,
          content: postContent,
        },
      };
      await context.graphql(`
        mutation createPost($post: somepublicaddress_near_hypeindexer_posts_insert_input!){
          insert_somepublicaddress_near_hypeindexer_posts_one(
            object: $post
          ) {
            id
          }
        }`,
        postObject
      );
      console.log("Post created!");
    } catch (error) {
      console.error(error);
    }
  }

  async function createComment(accountId, postId, blockHeight, blockTimestamp, receiptId, commentContent) {
    try {
      const commentObject = {
        comment: {
          account_id: accountId,
          post_id: postId,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: receiptId,
          content: commentContent,
        },
      };
      await context.graphql(`
        mutation createComment($comment: somepublicaddress_near_hypeindexer_comments_insert_input!){
          insert_somepublicaddress_near_hypeindexer_comments_one(
            object: $comment
          ) {
            id
          }
        }`,
        commentObject
      );
      console.log("Comment created!");
    } catch (error) {
      console.error(error);
    }
  }
}
