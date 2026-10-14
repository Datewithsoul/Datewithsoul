import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { resolveMapQuery, mapEmbedUrl, mapDirectionsUrl } from "@/lib/google-maps";
import { Sk } from "@/components/skeletons";

export async function ClassLocationMap({
  locationName,
  googleMapUrl,
}: {
  locationName: string | null;
  googleMapUrl: string | null;
}) {
  const query = await resolveMapQuery(googleMapUrl, locationName);
  const name = locationName || "สถานที่จัดคลาส";
  const openUrl = googleMapUrl || (query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#eadfca] bg-white">
      {query && (
        <div className="relative aspect-[16/10] sm:aspect-[16/8] w-full bg-[#fff9e8]">
          <Sk className="absolute inset-0 rounded-none" />
          <iframe
            src={mapEmbedUrl(query)}
            title={`แผนที่ ${name}`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#fff9e8] p-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E51D53] text-white shadow-sm">
            <MapPin size={22} />
          </div>
          <p className="text-lg font-bold text-[#3d3229] truncate">{name}</p>
        </div>

        {query && (
          <div className="flex gap-2 shrink-0">
            <a
              href={mapDirectionsUrl(query)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E51D53] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b9143f]"
            >
              <Navigation size={15} />
              นำทาง
            </a>
            {openUrl && (
              <a
                href={openUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#eadfca] bg-white px-4 py-2 text-sm font-semibold text-[#3d3229] transition-colors hover:border-[#E51D53] hover:text-[#E51D53]"
              >
                <ExternalLink size={15} />
                เปิดใน Google Maps
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
