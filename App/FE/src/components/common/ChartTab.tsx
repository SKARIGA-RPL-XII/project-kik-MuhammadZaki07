interface ChartTabProps {
  selected: "monthly" | "quarterly" | "annually";
  onSelect: (value: "monthly" | "quarterly" | "annually") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ selected, onSelect }) => {
  const getButtonClass = (option: string) =>
    selected === option
      ? "shadow-theme-xs text-neutral-900 dark:text-white bg-white dark:bg-neutral-800"
      : "text-neutral-500 dark:text-neutral-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-900">
      <button
        onClick={() => onSelect("monthly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-neutral-900 dark:hover:text-white transition-all ${getButtonClass("monthly")}`}
      >
        Monthly
      </button>

      <button
        onClick={() => onSelect("quarterly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-neutral-900 dark:hover:text-white transition-all ${getButtonClass("quarterly")}`}
      >
        Quarterly
      </button>

      <button
        onClick={() => onSelect("annually")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-neutral-900 dark:hover:text-white transition-all ${getButtonClass("annually")}`}
      >
        Annually
      </button>
    </div>
  );
};

export default ChartTab;