import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function LogoUpload(props: any) {
  const { logo, setLogo, logoSize, setLogoSize } = props;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="border rounded-xl p-6 space-y-4">
      {logo ? (
        <>
          <img src={logo} className="w-24 h-24 object-contain mx-auto" />
          <Slider value={[logoSize]} min={10} max={30} step={1} onValueChange={(v) => setLogoSize(v[0])} />
          <Button variant="ghost" onClick={() => setLogo("")}>Remove Logo</Button>
        </>
      ) : (
        <label className="cursor-pointer block text-center border-dashed border rounded-lg p-6">
          Upload Logo
          <input type="file" hidden accept="image/*" onChange={handleUpload} />
        </label>
      )}
    </div>
  );
}
