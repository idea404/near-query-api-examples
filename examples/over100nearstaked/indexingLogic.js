function getBlock(block, context) {
  function base64decode(encodedValue) {
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }

  const stakeTransactions = block.actions().flatMap((action) =>
    action.operations
      .map((operation) => operation["Stake"])
      .map((functionCallOperation) => ({
        ...functionCallOperation,
        receiptId: action.receiptId,
      }))
  );
  if (stakeTransactions.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    const stakeTransactionsOver100Near = [];
    stakeTransactions.forEach((stakeInfo) => {
      if (stakeInfo.stake > 100) {
        const stakeData = {
          account_id: stakeInfo.accountId,
          amount: stakeInfo.stake,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: stakeInfo.receiptId,
        };
        stakeTransactionsOver100Near.push(stakeData);
      }
    });
    if (stakeTransactionsOver100Near.length > 0) {
      await context.set(
        blockHeight.toString(),
        JSON.stringify(stakeTransactionsOver100Near)
      );
    }
  }
}
