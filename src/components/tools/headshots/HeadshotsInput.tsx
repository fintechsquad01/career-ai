"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X } from "lucide-react";

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface HeadshotsInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

const STYLES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "modern", label: "Modern" },
] as const;

const BACKGROUNDS = [
  { value: "neutral", label: "Neutral" },
  { value: "office", label: "Office" },
  { value: "gradient", label: "Gradient" },
] as const;

function FileThumbnail({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
      {url && <img src={url} alt={file.name} className="w-10 h-10 object-cover rounded" />}
      <span className="text-sm text-gray-700 truncate max-w-[120px]">{file.name}</span>
      <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-600 p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function HeadshotsInput({ onSubmit }: HeadshotsInputProps) {
  const [style, setStyle] = useState<string>("professional");
  const [background, setBackground] = useState<string>("neutral");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploadError("");
    const selected = Array.from(fileList);
    for (const f of selected) {
      if (!ACCEPT_TYPES.includes(f.type)) {
        setUploadError(`"${f.name}" is not a valid format. Use JPEG, PNG, or WebP.`);
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`"${f.name}" exceeds ${MAX_SIZE_MB}MB.`);
        return;
      }
    }
    if (files.length + selected.length > MAX_FILES) {
      setUploadError(`Maximum ${MAX_FILES} images allowed.`);
      return;
    }
    setFiles((prev) => [...prev, ...selected].slice(0, MAX_FILES));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClick = () => {
    onSubmit({
      style,
      background,
      fileNames: files.map((f) => f.name),
      files,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
          <Camera className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Headshots</h3>
          <p className="text-xs text-gray-500">Professional headshots powered by AI</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          multiple
          aria-label="Upload photos for AI headshots"
          className="hidden"
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-blue-400", "bg-blue-50/50");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/50");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/50");
            processFiles(e.dataTransfer?.files ?? null);
          }}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center min-h-[120px] flex flex-col items-center justify-center hover:border-blue-300 transition-colors cursor-pointer"
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Drop your photo here or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">Up to {MAX_FILES} images, max {MAX_SIZE_MB}MB each (JPEG, PNG, WebP)</p>
        </div>
        {uploadError && <p className="text-sm text-red-600 mt-2">{uploadError}</p>}
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((file, i) => (
              <FileThumbnail key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                style === s.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBackground(b.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                background === b.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>4 professional AI headshots</li>
          <li>Multiple styles and backgrounds</li>
          <li>LinkedIn-ready quality</li>
        </ul>
      </div>

      <button
        onClick={handleSubmitClick}
        disabled={files.length === 0}
        className="btn-primary"
      >
        Generate Headshots — 20 tokens
      </button>
    </div>
  );
}
