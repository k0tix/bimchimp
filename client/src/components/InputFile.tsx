import { Input } from "../components/ui/input";

export function InputFile() {
  return (
    <div className="w-full mt-4 mb-4 flex items-center justify-center">
      <Input id="ifc-file" type="file" className="bg-card" />
    </div>
  );
}
