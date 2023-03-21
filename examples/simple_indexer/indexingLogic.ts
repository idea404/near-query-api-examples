import { Block } from "@near-lake/primitives";

async function getBlock(block: Block, context) {
  // Add your code here
  const h = block.header().height;
  await context.set(
    "block_height:" + h.toString(),
    "actions_length:" + block.actions().length.toString()
  );
}
