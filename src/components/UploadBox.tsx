import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export type UploadBoxProps = {
  accept: string;
  extensions: string[];
  maxSizeMb: number;
  hint: string;
  file: File | null;
  disabled?: boolean;
  onFile: (file: File) => void;
  onError: (message: string) => void;
};

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function UploadBox({
  accept,
  extensions,
  maxSizeMb,
  hint,
  file,
  disabled,
  onFile,
  onError,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function validate(candidate: File) {
    const ext = candidate.name.slice(candidate.name.lastIndexOf(".")).toLowerCase();
    if (!extensions.includes(ext)) {
      onError(`That file type is not supported. Please use ${extensions.join(", ")}.`);
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      onError(`This file is too large. The maximum size is ${maxSizeMb} MB.`);
      return;
    }
    onFile(candidate);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) validate(dropped);
      }}
      className={`surface-card grid place-items-center px-5 py-10 text-center transition-colors sm:px-8 ${
        dragging ? "border-primary bg-primary/5" : ""
      }`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <UploadCloud className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-bold tracking-tight">
        {file ? file.name : "Drag and drop your file here"}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {file ? `${formatSize(file.size)} selected` : hint}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const chosen = e.target.files?.[0];
          if (chosen) validate(chosen);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="btn-secondary mt-5"
      >
        {file ? "Choose a different file" : "Browse files"}
      </button>
    </div>
  );
}
