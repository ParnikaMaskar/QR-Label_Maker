import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface PrintConfig {
  paperSize: "a3" | "a4" | "a5" | "letter" | "legal" | "executive" | "custom";
  labelWidth: number;
  labelHeight: number;
  gapHorizontal: number;
  gapVertical: number;
  marginTop: number;
  marginLeft: number;
  labelsPerRow: number;
}

interface PrintSettingsProps {
  config: PrintConfig;
  onChange: (config: PrintConfig) => void;
  onManualResize?: () => void;   // ✅ NEW
}


export const defaultPrintConfig: PrintConfig = {
  paperSize: "a4",
  labelWidth: 50,
  labelHeight: 30,
  gapHorizontal: 5,
  gapVertical: 5,
  marginTop: 10,
  marginLeft: 10,
  labelsPerRow: 3,
};

export const PrintSettings = ({
  config,
  onChange,
  onManualResize,   // ✅ RECEIVE IT HERE
}: PrintSettingsProps) => {

  const updateConfig = (key: keyof PrintConfig, value: string | number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Print Settings</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Paper Size</Label>
          <Select
            value={config.paperSize}
            onValueChange={(value) => updateConfig("paperSize", value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a3">A3 (297×420mm)</SelectItem>
              <SelectItem value="a4">A4 (210×297mm)</SelectItem>
              <SelectItem value="a5">A5 (148×210mm)</SelectItem>
              <SelectItem value="letter">Letter (8.5×11in)</SelectItem>
              <SelectItem value="legal">Legal (8.5×14in)</SelectItem>
              <SelectItem value="executive">Executive (7.25×10.5in)</SelectItem>
              <SelectItem value="custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Labels Per Row</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={config.labelsPerRow}
            onChange={(e) => {
  updateConfig("labelsPerRow", parseInt(e.target.value) || 1);
  onManualResize?.();   // ✅ add
}}

            className="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Label Width (mm)</Label>
          <Input
            type="number"
            value={config.labelWidth}
            onChange={(e) => {
              updateConfig("labelWidth", parseInt(e.target.value) || 50);
              onManualResize?.();      // ✅ disable auto sizing
            }}
          />




        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Label Height (mm)</Label>
          <Input
            type="number"
            min={10}
            max={200}
            value={config.labelHeight}
            onChange={(e) => {
              updateConfig("labelHeight", parseInt(e.target.value) || 30);
              onManualResize?.();     // 👈 notify parent
            }}
            className="h-9"
          />

        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Gap Horizontal (mm)</Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={config.gapHorizontal}
            onChange={(e) => {
  updateConfig("gapHorizontal", parseInt(e.target.value) || 0);
  onManualResize?.();   // ✅ add
}}

            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Gap Vertical (mm)</Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={config.gapVertical}
           onChange={(e) => {
  updateConfig("gapVertical", parseInt(e.target.value) || 0);
  onManualResize?.();   // ✅ add
}}

            className="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Margin Top (mm)</Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={config.marginTop}
            onChange={(e) => {
  updateConfig("marginTop", parseInt(e.target.value) || 0);
  onManualResize?.();   // ✅ add
}}

            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Margin Left (mm)</Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={config.marginLeft}
            onChange={(e) => {
  updateConfig("marginLeft", parseInt(e.target.value) || 0);
  onManualResize?.();   // ✅ add
}}

          />
        </div>
      </div>
    </div>
  );
};
