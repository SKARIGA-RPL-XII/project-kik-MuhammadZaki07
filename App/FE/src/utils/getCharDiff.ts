import { diffLines } from "diff";

export const getCharDiff = (before: any, after: any) => {
  const beforeStr =
    typeof before === "object"
      ? JSON.stringify(before, null, 2)
      : String(before ?? "");

  const afterStr =
    typeof after === "object"
      ? JSON.stringify(after, null, 2)
      : String(after ?? "");

  return diffLines(beforeStr, afterStr);
};