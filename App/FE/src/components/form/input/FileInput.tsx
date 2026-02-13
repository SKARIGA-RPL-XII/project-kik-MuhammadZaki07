import { FC } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: FC<FileInputProps> = ({ className, onChange }) => {
  return (
    <input
      type="file"
      className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-neutral-300 bg-transparent text-sm text-neutral-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-neutral-200 file:bg-neutral-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-neutral-700 placeholder:text-neutral-400 hover:file:bg-neutral-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:text-white/90 dark:file:border-neutral-800 dark:file:bg-white/[0.03] dark:file:text-neutral-400 dark:placeholder:text-neutral-400 ${className}`}
      onChange={onChange}
    />
  );
};

export default FileInput;
