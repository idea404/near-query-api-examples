function getBlock(block, context) {
  // Add your code here
  const h = block.header().height;
  context.set("height", h);
}
