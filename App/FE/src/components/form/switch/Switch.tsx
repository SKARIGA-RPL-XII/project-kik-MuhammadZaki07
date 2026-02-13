
interface SwitchProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "neutral";
}


const Switch: React.FC<SwitchProps> = ({
  label,
  checked = false,
  disabled = false,
  onChange,
  color = "blue",
}) => {
  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const switchColors =
    color === "blue"
      ? {
          background: checked
            ? "bg-brand-500"
            : "bg-neutral-200 dark:bg-white/10",
          knob: checked
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        }
      : {
          background: checked
            ? "bg-neutral-800 dark:bg-white/10"
            : "bg-neutral-200 dark:bg-white/10",
          knob: checked
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled ? "text-neutral-400" : "text-neutral-700 dark:text-neutral-400"
      }`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block h-6 w-11 rounded-full transition ${
            disabled
              ? "bg-neutral-100 dark:bg-neutral-800"
              : switchColors.background
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow transition transform ${switchColors.knob}`}
        />
      </div>
      {label}
    </label>
  );
};


export default Switch;
