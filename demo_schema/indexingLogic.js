function getBlock(block, context) {
  await context.set("demo_schema_BlockHeight", block.header().height);
}
