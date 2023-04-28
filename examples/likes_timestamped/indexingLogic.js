async function getBlock(block, context) {
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

  let hasLikes = false; 
  if (nearSocialPosts.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    const formatted_likes = [];
    nearSocialPosts.forEach((postAction) => {
      const accountId = Object.keys(postAction.args.data)[0];
      if (postAction.args.data[accountId].index.like) {
        context.log(`Found like for post ${JSON.stringify(postAction.args)} by ${accountId}`);
        hasLikes = true;
        const likeData = {
          account_id: accountId,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: postAction.receiptId,
          like: postAction.args.data[accountId].index.like,
          post_id: postAction.args.data[accountId].index.like.key.path + blockHeight,
        };
        formatted_likes.push(JSON.stringify(likeData));
      }
    });
    if (hasLikes) {
      await context.set(blockHeight.toString(), JSON.stringify(formatted_likes));
    }
  }
}
