import { site } from "@/lib/site";

export default function Disclaimer() {
  return (
    <div className="border-t border-navy-100 bg-navy-50">
      <div className="mx-auto max-w-6xl px-6 py-6 text-xs leading-relaxed text-navy-600 md:px-10">
        <strong className="font-semibold text-navy-900">Disclaimer.</strong>{" "}
        {site.disclaimer}
      </div>
    </div>
  );
}
