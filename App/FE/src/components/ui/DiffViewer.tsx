type Props = {
  before?: any;
  after?: any;
};

const isObject = (val: any) =>
  val && typeof val === "object" && !Array.isArray(val);

export default function DiffViewer({ before, after }: Props) {
  const beforeObj = isObject(before) ? before : {};
  const afterObj = isObject(after) ? after : {};

  const keys = Array.from(
    new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]),
  );

  const diffs = keys
    .map((key) => {
      const oldVal = beforeObj[key];
      const newVal = afterObj[key];

      const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);

      if (!changed) return null;

      return { key, oldVal, newVal };
    })
    .filter(Boolean);

  return (
    <div className="font-mono text-sm">
      <pre>
        {"{"}

        {diffs.length === 0 && (
          <div className="ml-4 text-neutral-500 italic">
            No changes detected
          </div>
        )}

        {diffs.map((item: any) => {
          const isChanged =
            JSON.stringify(item.oldVal) !== JSON.stringify(item.newVal);

          return (
            <div key={item.key} className="ml-4 mb-3 space-y-1">
              {item.oldVal !== undefined && (
                <div className="inline-flex w-fit items-center bg-red-500/20 text-rose-300 rounded px-2 py-1 mr-2">
                  <span className={isChanged ? "font-bold" : "font-normal"}>
                    - {item.key}:
                  </span>
                  <span className="ml-2">"{String(item.oldVal)}"</span>
                </div>
              )}

              {item.newVal !== undefined && (
                <div className="inline-flex w-fit items-center bg-green-500/20 text-green-300 rounded px-2 py-1">
                  <span className={isChanged ? "font-bold" : "font-normal"}>
                    + {item.key}:
                  </span>
                  <span className="ml-2">"{String(item.newVal)}"</span>
                </div>
              )}
            </div>
          );
        })}

        {"}"}
      </pre>
    </div>
  );
}
