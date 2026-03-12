import { resolveDocIdToPath } from "./src/lib/doc-resolver";

async function test() {
  const docId = "L3Zhci93d3cvaHRtbC9rb253bGVkZ2UvYmFkbWludG9uLWtiL3lieHkv5Zmo5p2Q5LiO6KeE5YiZIChHZWFyICYgUnVsZXMpL-WZqOadkOS4juinhOWImSAoR2VhciAmIFJ1bGVzKS5tZA";
  const filePath = await resolveDocIdToPath(docId);
  console.log("Resolved file path:", filePath);
  
  if (filePath) {
    console.log("File exists:", require("fs").existsSync(filePath));
  }
}

test().catch(console.error);