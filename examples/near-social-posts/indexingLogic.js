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
    );
  if (nearSocialPosts.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    const formatted_posts = [];
    nearSocialPosts.forEach((postAction) => {
      const accountId = Object.keys(postAction.args.data)[0];
      if (postAction.args.data[accountId].post) {
        const postData = {
          account_id: accountId,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: postAction.receiptId,
          post: postAction.args.data[accountId].post.main,
        };
        formatted_posts.push(postData);
      }
    });
    await context.set(blockHeight.toString(), JSON.stringify(formatted_posts));
  }
}
