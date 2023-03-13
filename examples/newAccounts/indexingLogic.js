function getBlock(block, context) {
  const newNearAccounts = block.actions().flatMap((action) =>
    action.operations
      .map((operation) => operation["CreateAccount"])
      .map((createAccountOperation) => ({
        ...createAccountOperation,
        receiptId: action.receiptId,
      }))
  );
  if (newNearAccounts.length > 0) {
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    const formatted_newAccountIds = [];
    newNearAccounts.forEach((newAccount) => {
      const accountId = newAccount.new_account_id;
      if (accountId) {
        const newAccountData = {
          account_id: accountId,
          block_height: blockHeight,
          block_timestamp: blockTimestamp,
          receipt_id: newAccount.receiptId,
        };
        formatted_newAccountIds.push(newAccountData);
      }
    });
    if (formatted_newAccountIds.length > 0) {
      await context.set(
        blockHeight.toString(),
        JSON.stringify(formatted_newAccountIds)
      );
    }
  }
}
