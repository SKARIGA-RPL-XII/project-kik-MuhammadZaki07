export default function TwoColumnImageGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <img
          src="/images/grid-image/image-02.png"
          alt=" grid"
          className="border border-neutral-200 rounded-xl dark:border-neutral-800"
        />
      </div>

      <div>
        <img
          src="/images/grid-image/image-03.png"
          alt=" grid"
          className="border border-neutral-200 rounded-xl dark:border-neutral-800"
        />
      </div>
    </div>
  );
}
