import { useCallback } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface FileUploaderProps {
  onDataLoaded: (data: Record<string, string>[]) => void;
  accept?: string;
}

export const FileUploader = ({ onDataLoaded, accept = ".csv,.xlsx,.xls" }: FileUploaderProps) => {
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const data = await parseFile(file);
        if (data.length === 0) {
          toast.error("No data found in file");
          return;
        }
        
        const maxAttributes = 5;
        const limitedData = limitAttributes(data, maxAttributes);
        
        onDataLoaded(limitedData);
        toast.success(`Loaded ${limitedData.length} rows from ${file.name}`);
      } catch (error) {
        toast.error("Failed to parse file.");
        console.error(error);
      }
      event.target.value = "";
    },
    [onDataLoaded]
  );

  const parseFile = async (file: File): Promise<Record<string, string>[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
      defval: "",
      raw: false,
    });
  };

  const limitAttributes = (data: Record<string, string>[], maxAttrs: number): Record<string, string>[] => {
    return data.map((row) => {
      const keys = Object.keys(row);
      const limitedRow: Record<string, string> = {};
      keys.slice(0, maxAttrs).forEach((key) => {
        limitedRow[key] = row[key];
      });
      return limitedRow;
    });
  };

  return (
    <motion.label
      // Changed to flex-1 and removed fixed height to prevent boundary overflow
      className="flex flex-col items-center justify-center w-full flex-1 min-h-[110px] border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all p-2 overflow-hidden"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex flex-col items-center justify-center text-center w-full px-2 gap-1 text-muted-foreground">
        {/* Icons now use default muted text color (no specific colors) */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Upload className="w-5 h-5 opacity-70" />
          <FileSpreadsheet className="w-5 h-5 opacity-70" />
        </div>
        
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-[13px] font-semibold text-foreground block">
            Upload CSV or Excel file
          </span>
          <span className="text-[11px] opacity-80 block">
            Click or drag and drop
          </span>
        </div>
      </div>

      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileUpload}
      />
    </motion.label>
  );
};