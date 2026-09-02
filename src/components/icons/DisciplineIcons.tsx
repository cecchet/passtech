import { DisciplineGroup } from "@/data/types";

/** Frog Race Team mascot artwork for each discipline, cropped from public/discipline1.jpg / discipline2.jpg (see public/discipline-*.jpg). */
export const DISCIPLINE_ICON_SRC: Record<DisciplineGroup, string> = {
  Autocross: "/discipline-autocross.jpg",
  RallyCross: "/discipline-rallycross.jpg",
  Rally: "/discipline-rally.jpg",
  "Road Racing": "/discipline-road-racing.jpg",
  Hillclimb: "/discipline-hillclimb.jpg",
  "Ice Racing": "/discipline-ice-racing.jpg",
  "Endurance Racing": "/discipline-endurance-racing.jpg",
  "HPDE / Track Day": "/discipline-hpde.jpg",
  "Drag Racing": "/discipline-drag-racing.jpg",
  Karting: "/discipline-karting.jpg",
  Drifting: "/discipline-drifting.jpg",
};

export function DisciplineIcon({ group, className = "h-6 w-6" }: { group: DisciplineGroup; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img>
    <img src={DISCIPLINE_ICON_SRC[group]} alt="" className={`${className} shrink-0 rounded object-cover`} />
  );
}
