import { EquipmentCategory } from "./types";

export const CATEGORY_ORDER: EquipmentCategory[] = [
  "helmet",
  "hnr",
  "firesuit",
  "gloves",
  "shoes",
  "undergarment",
  "arm_restraint",
];

interface CategoryMeta {
  label: string;
  /** Pure standard-based categories (helmet/hnr/firesuit) always need a cert. Hybrid categories can be satisfied by plain material with no cert, depending on the body's rule. */
  hybrid: boolean;
  hint: string;
}

export const CATEGORY_META: Record<EquipmentCategory, CategoryMeta> = {
  helmet: { label: "Helmet", hybrid: false, hint: "Standard printed on the certification sticker inside the helmet." },
  hnr: { label: "Head & Neck Restraint (HANS/HNR)", hybrid: false, hint: "Standard printed on the device's conformance label." },
  firesuit: { label: "Firesuit / Driving Suit", hybrid: true, hint: "Standard printed on the suit's homologation label — most bodies require a certified suit, but a few accept plain fire-resistant clothing at lower tiers." },
  gloves: { label: "Gloves", hybrid: true, hint: "Some bodies accept plain fire-resistant material; others require SFI or FIA certification." },
  shoes: { label: "Shoes", hybrid: true, hint: "Some bodies accept plain fire-resistant/non-flammable material; others require SFI or FIA certification." },
  undergarment: { label: "Fire-resistant Undergarment", hybrid: true, hint: "Optional/conditional for most bodies — depends on your suit's rating." },
  arm_restraint: { label: "Arm Restraint", hybrid: true, hint: "Typically required for open cars, cars without roll-up windows, or as an alternative to a window net." },
};
