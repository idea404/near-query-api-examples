async function getBlock(block, context) {
  const SOCIAL_DB = "social.near";
  function base64decode(encodedValue) {
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }

  const nearSocialLikes = block
    .actions()
    .filter((action) => action.receiverId === SOCIAL_DB)
    .flatMap((action) =>
      action.operations
        .map((operation) => operation["FunctionCall"])
        .filter((operation) => operation?.methodName === "set")
        .filter((functionCall) => {
          const accountId = Object.keys(functionCall.args.data)[0];
          const hasLike = functionCall.args.data[accountId].index?.like;
          hasLike == true;
        })
        .map((functionCallOperation) => ({
          ...functionCallOperation,
          args: base64decode(functionCallOperation.args),
          receiptId: action.receiptId,
        }))
    );
  if (nearSocialLikes.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    const formatted_likes = [];
    nearSocialLikes.forEach((likeAction) => {
      const accountId = Object.keys(likeAction.args.data)[0];
      const likeData = {
        account_id: accountId,
        block_height: blockHeight,
        block_timestamp: blockTimestamp,
        receipt_id: likeAction.receiptId,
        like: likeAction.args.data[accountId].index.like,
        post_id: likeAction.args.data[accountId].index.like.key.path + blockHeight,
      };
      formatted_likes.push(likeData);
    });
    await context.set(blockHeight.toString(), JSON.stringify(formatted_likes));
  }
}
