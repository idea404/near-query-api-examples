function getBlock(block, context) {
  const SOCIAL_DB = "social.near";
  function base64decode(encodedValue) {
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }

  const newNearAccounts = block
    .actions()
    .filter((action) => action.receiverId === SOCIAL_DB)
    .flatMap((action) =>
      action.operations
        .map((operation) => operation["CreateAccount"])
        .map((functionCallOperation) => ({
          ...functionCallOperation,
          args: base64decode(functionCallOperation.args),
          receiptId: action.receiptId,
        }))
    );
  if (newNearAccounts.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    const formatted_newAccountIds = [];
    newNearAccounts.forEach((newAccount) => {
      const accountId = Object.keys(newAccount.args.data)[0];
      if (newAccount.args.data[accountId].post) {
        const newAccountData = {
          account_id: accountId,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: newAccount.receiptId,
        };
        formatted_newAccountIds.push(newAccountData);
      }
    });
    if (formatted_posts.length > 0) {
      await context.set(
        blockHeight.toString(),
        JSON.stringify(formatted_newAccountIds)
      );
    }
  }
}
