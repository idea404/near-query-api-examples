function getBlock(block, context) {
  const SOCIAL_DB = "social.near";
  function base64decode(encodedValue) {
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }

  const nearSocialPosts = block
    .actions()
    .filter((action) => action.receiverId === SOCIAL_DB)
    .flatMap((action) =>
      action.operations
        .map((operation) => operation["FunctionCall"])
        .filter((operation) => operation?.methodName === "set")
        .map((functionCallOperation) => ({
          ...functionCallOperation,
          args: base64decode(functionCallOperation.args),
          receiptId: action.receiptId,
        }))
        .filter((functionCall) => {
          const accountId = Object.keys(functionCall.args.data)[0];
          return (
            functionCall.args.data[accountId].post ||
            functionCall.args.data[accountId].index
          );
        })
    );
  if (nearSocialPosts.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    nearSocialPosts.forEach(async (postAction) => {
      const accountId = Object.keys(postAction.args.data)[0];
      if (
        postAction.args.data[accountId].post &&
        postAction.args.data[accountId].post.main
      ) {
        const postData = {
          account_id: accountId,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: postAction.receiptId,
          post: postAction.args.data[accountId].post.main,
        };
        const mutationData = {
          post: {
            account_id: accountId,
            block_height: postData.block_height.toString(),
            block_timestamp: postData.block_timestamp,
            receipt_id: postData.receipt_id,
            content: postData.post,
          },
        };
        await context.graphql(
          "mutation createPost($post:posts_insert_input!) { insert_posts_one(object: $post on_conflict: {constraint: posts_account_id_block_height_key, update_columns: content}) { id } }",
          mutationData
        );
      }
    });
  }
}
