"use client";

import { useEffect, useState } from "react";
import { EquipmentCategory, Occupant } from "@/data/types";
import { CATEGORY_META } from "@/data/categoryMeta";
import { CategoryCard, MyGearSlot, summarizeEntryCerts } from "@/components/EquipmentForm";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { ZoomableThumb } from "@/components/ZoomableThumb";
import { computeGearExpiryWarnings, formatGearExpiryWarning } from "@/lib/gearExpiration";
import { GEAR_ITEM_CATEGORIES, GarageProfile, GearItem, UserPreferences, newGarageProfile, newGearItem } from "@/lib/garage";
import { isEntryEmpty } from "@/lib/matcher";
import { StickerView, fetchSticker, formatStickerCode, stickerStatusLine } from "@/lib/stickers";

const buttonClass = "rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800";

/** The item's first photo, wherever its category keeps them (an extinguisher's are on its units). */
const firstPhoto = (item: GearItem) => item.entry.photoDataUrls?.[0] ?? item.entry.extinguisherUnits?.[0]?.photoDataUrls?.[0];

/** What tells two items of a category apart: the driver's name for it, else its certifications. */
export function gearItemLabel(item: GearItem): string {
  if (item.name?.trim()) return item.name.trim();
  const certs = summarizeEntryCerts(item.category, item.entry, undefined).map((b) => b.label);
  return certs.length ? certs.join(", ") : CATEGORY_META[item.category].label;
}

/** The sets using an item, and in which seat. */
function usedIn(item: GearItem, profiles: GarageProfile[]): { profile: GarageProfile; occupant: Occupant }[] {
  return profiles.flatMap((p) => [
    ...(p.itemIds?.[item.category] === item.id ? [{ profile: p, occupant: "driver" as const }] : []),
    ...(p.codriverItemIds?.[item.category] === item.id ? [{ profile: p, occupant: "codriver" as const }] : []),
  ]);
}

function expiryWarnings(item: GearItem, preferences: UserPreferences) {
  return computeGearExpiryWarnings({ ...newGarageProfile(""), entries: { [item.category]: item.entry } }, preferences);
}

function StickerBadge({ code }: { code: string }) {
  const [view, setView] = useState<StickerView | null>(null);
  useEffect(() => {
    let live = true;
    fetchSticker(code).then((v) => live && setView(v), () => {});
    return () => {
      live = false;
    };
  }, [code]);
  const color = view?.status === "valid" ? "border-emerald-700 text-emerald-300" : view ? "border-red-700 text-red-300" : "border-neutral-600 text-neutral-300";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${color}`}>
      🔳 {formatStickerCode(code)}
      {view ? ` · ${stickerStatusLine(view)}` : ""}
    </span>
  );
}

/**
 * My Gear's pieces of gear, one section per kind (Helmet, HANS...): each item with its
 * certifications, tech sticker, expiry warnings and the gear sets using it; open one to edit it,
 * apply for an annual sticker, or put it in a gear set. "Add a piece of gear" starts one without
 * any gear set -- all an autocrosser with just a helmet needs.
 */
export function GearItems({
  items,
  profiles,
  preferences,
  onAdd,
  onChange,
  onDelete,
  onLink,
  onClose,
  picking,
  setPicking,
}: {
  /** Whether the "what piece of gear?" picker is showing (its button is the caller's). */
  picking: boolean;
  setPicking: (v: boolean) => void;
  items: GearItem[];
  /** Stored gear sets (their itemIds tell which items they use). */
  profiles: GarageProfile[];
  preferences: UserPreferences;
  onAdd: (item: GearItem) => void;
  onChange: (item: GearItem) => void;
  /** Deletes the item and takes it out of every set. */
  onDelete: (id: string) => void;
  onLink: (profileId: string, occupant: Occupant, category: EquipmentCategory, itemId: string) => void;
  /** An item's editor closed: drop it if nothing was entered. */
  onClose: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  /** The item just added, still open: Cancel discards it. */
  const [newId, setNewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // A just-added item opens in its section, further down: bring it into view.
  useEffect(() => {
    if (newId) document.getElementById(`gear-item-${newId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [newId]);

  const close = () => {
    setOpenId(null);
    setNewId(null);
    setConfirmDeleteId(null);
    onClose();
  };
  const add = (category: EquipmentCategory) => {
    const item = newGearItem(category);
    onAdd(item);
    setPicking(false);
    setOpenId(item.id);
    setNewId(item.id);
  };

  // An empty item shows only while it's open (just added): closing drops it.
  const shown = items.filter((i) => i.id === openId || !isEntryEmpty(i.category, i.entry));
  const sections = GEAR_ITEM_CATEGORIES.map((category) => ({ category, items: shown.filter((i) => i.category === category) })).filter((s) => s.items.length);

  return (
    <div className="mb-4">
      {picking ? (
        <div className="mb-3 rounded-lg border border-emerald-800 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm text-neutral-300">What piece of gear?</p>
            <button type="button" onClick={() => setPicking(false)} className="text-sm font-semibold text-amber-400 hover:text-amber-300">
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GEAR_ITEM_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => add(category)}
                  className="flex items-center gap-2 rounded-lg border border-neutral-700 p-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                >
                  <Icon />
                  {CATEGORY_META[category].label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {sections.length > 0 && (
        <div id="tutorial-gear-items" className="flex flex-col gap-3">
          {sections.map(({ category, items: list }) => (
            <section key={category}>
              <h2 className="mb-1 text-sm font-semibold text-neutral-300">
                {CATEGORY_META[category].label} <span className="font-normal text-neutral-500">({list.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {list.map((item) => {
                  const isOpen = openId === item.id;
                  const sets = usedIn(item, profiles);
                  const warnings = expiryWarnings(item, preferences);
                  const photo = firstPhoto(item);
                  const Icon = CATEGORY_ICONS[item.category];
                  const certs = summarizeEntryCerts(item.category, item.entry, undefined);
                  const label = CATEGORY_META[item.category].label.toLowerCase();
                  return (
                    <div key={item.id} id={`gear-item-${item.id}`} className="scroll-mt-4 rounded-lg border border-neutral-700 p-3">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (isOpen) close();
                          else setOpenId(item.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (isOpen) close();
                            else setOpenId(item.id);
                          }
                        }}
                        className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 text-left"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {photo ? (
                            <span onClick={(e) => e.stopPropagation()}>
                              <ZoomableThumb src={photo} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                            </span>
                          ) : (
                            <Icon />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{item.name?.trim() || (certs.length ? certs.map((b) => b.label).join(", ") : `New ${label}`)}</p>
                            {item.name?.trim() && certs.length > 0 && <p className="truncate text-xs text-neutral-400">{certs.map((b) => b.label).join(", ")}</p>}
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                              {item.entry.stickerCode && <StickerBadge code={item.entry.stickerCode} />}
                              <span>{sets.length ? `In ${sets.map((s) => s.profile.name + (s.occupant === "codriver" ? " (codriver)" : "")).join(", ")}` : "Not in a gear set"}</span>
                            </div>
                          </div>
                        </div>
                        <span className="flex shrink-0 items-center gap-2">
                          {!isOpen && warnings.some((w) => w.severity === "rejected") && (
                            <span className="text-lg" title="A preferred sanctioning body rejects it as expired">
                              ✋
                            </span>
                          )}
                          {!isOpen && warnings.length > 0 && !warnings.some((w) => w.severity === "rejected") && (
                            <span className="text-lg" title="Expired or expiring soon with a preferred sanctioning body">
                              ⚠️
                            </span>
                          )}
                          <span className="text-neutral-500">{isOpen ? "▲" : "▼"}</span>
                        </span>
                      </div>
                      {isOpen && (
                        <div className="mt-3 flex flex-col gap-3 border-t border-neutral-800 pt-3">
                          {warnings.map((w) => (
                            <p
                              key={`${w.severity}-${w.date}`}
                              className={
                                w.severity === "rejected"
                                  ? "rounded border border-red-800 bg-red-950/40 px-2 py-1 text-xs text-red-300"
                                  : "rounded border border-amber-800 bg-amber-950/40 px-2 py-1 text-xs text-amber-300"
                              }
                            >
                              {w.severity === "rejected" ? "✋" : "⚠️"} {formatGearExpiryWarning(w)}
                            </p>
                          ))}
                          <label className="block">
                            <span className="mb-1 block text-xs text-neutral-400">Name (optional, to tell your {label}s apart)</span>
                            <input
                              type="text"
                              value={item.name ?? ""}
                              placeholder={`e.g. White ${label}`}
                              onChange={(e) => onChange({ ...item, name: e.target.value || undefined, updatedAt: new Date().toISOString() })}
                              className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                            />
                          </label>
                          <CategoryCard
                            category={item.category}
                            entry={item.entry}
                            hasResultsContext={false}
                            isNewGroup={false}
                            defaultOpen
                            showPhotoUpload
                            stickerMode="garage"
                            onChange={(_, entry) => onChange({ ...item, entry, updatedAt: new Date().toISOString() })}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            {profiles.length > 0 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  const [profileId, occupant] = e.target.value.split("|");
                                  if (profileId) onLink(profileId, occupant as Occupant, item.category, item.id);
                                }}
                                className="rounded border border-neutral-600 bg-neutral-900 p-1 text-xs text-neutral-200"
                              >
                                <option value="">Use it in a gear set…</option>
                                {profiles.flatMap((p) =>
                                  (["driver", "codriver"] as const)
                                    .filter((o) => o === "driver" || p.hasCodriver)
                                    .map((o) => {
                                      const ids = o === "driver" ? p.itemIds : p.codriverItemIds;
                                      const current = ids?.[item.category];
                                      const replaced = current && current !== item.id ? items.find((i) => i.id === current) : undefined;
                                      return (
                                        <option key={`${p.id}|${o}`} value={`${p.id}|${o}`} disabled={current === item.id}>
                                          {p.name}
                                          {o === "codriver" ? " — codriver" : ""}
                                          {current === item.id ? " (already)" : replaced ? ` (replaces ${gearItemLabel(replaced)})` : ""}
                                        </option>
                                      );
                                    })
                                )}
                              </select>
                            )}
                            {confirmDeleteId === item.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDelete(item.id);
                                    close();
                                  }}
                                  className="rounded border border-red-500 bg-red-900 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-800"
                                >
                                  {sets.length ? `Delete it — ${sets.length === 1 ? "its gear set loses" : `${sets.length} gear sets lose`} it` : "Confirm delete?"}
                                </button>
                                <button type="button" onClick={() => setConfirmDeleteId(null)} className={buttonClass}>
                                  Cancel
                                </button>
                              </>
                            ) : newId === item.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onDelete(item.id);
                                  close();
                                }}
                                className={buttonClass}
                              >
                                Cancel
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(item.id)}
                                className="rounded border border-red-800 px-2 py-1 text-xs text-red-300 hover:bg-red-950"
                              >
                                🗑️ Delete this {label}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={close}
                              className="ml-auto rounded border border-emerald-700 bg-emerald-950 px-3 py-1 text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A gear set editor's card (Helmet, HANS...), for one seat: the piece of gear from My Gear it uses,
 * to swap or take out -- or, with none yet, the ones of that kind already in My Gear to pick from.
 * Undefined when My Gear has none of that kind other than the one in use (nothing to pick).
 */
export function myGearSlot({
  profile,
  items,
  profiles,
  occupant,
  category,
  onSet,
}: {
  /** As stored. */
  profile: GarageProfile;
  items: GearItem[];
  /** Stored gear sets, to tell where else an item is used. */
  profiles: GarageProfile[];
  occupant: Occupant;
  category: EquipmentCategory;
  onSet: (itemId: string | undefined) => void;
}): MyGearSlot | undefined {
  if (!GEAR_ITEM_CATEGORIES.includes(category)) return undefined;
  const linkedId = ((occupant === "driver" ? profile.itemIds : profile.codriverItemIds) ?? {})[category];
  const linked = linkedId ? items.find((i) => i.id === linkedId) : undefined;
  const others = items.filter((i) => i.category === category && i.id !== linkedId && !isEntryEmpty(i.category, i.entry));
  if (!linked && others.length === 0) return undefined;
  const elsewhere = linked
    ? usedIn(linked, profiles)
        .filter((u) => u.profile.id !== profile.id || u.occupant !== occupant)
        .map((u) => u.profile.name + (u.occupant === "codriver" ? " (codriver)" : ""))
    : [];
  const thumb = (item: GearItem) => {
    const src = firstPhoto(item);
    // eslint-disable-next-line @next/next/no-img-element -- user-provided photo, not a static bundled asset
    return src ? <img src={src} alt="" className="h-8 w-8 shrink-0 rounded object-cover" /> : null;
  };
  const choices = (
    <div className="flex flex-wrap gap-2">
      {others.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSet(item.id)}
          className="flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-950/40 px-2 py-1 text-left text-xs text-emerald-100 hover:bg-emerald-900"
        >
          {thumb(item)}
          <span>
            {gearItemLabel(item)}
            {item.name?.trim() && (
              <span className="block text-neutral-400">
                {summarizeEntryCerts(item.category, item.entry, undefined)
                  .map((b) => b.label)
                  .join(", ")}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
  if (!linked) {
    return {
      badge: <span className="shrink-0 rounded-full border border-emerald-800 px-2 py-0.5 text-xs text-emerald-300">{others.length} in My Gear</span>,
      picker: (
        <div className="mt-2 rounded-lg border border-emerald-900 p-2">
          <p className="mb-1.5 text-xs text-neutral-300">Use one from My Gear:</p>
          {choices}
          <p className="mt-1.5 text-xs text-neutral-500">Or enter a new one below &mdash; it joins My Gear too.</p>
        </div>
      ),
    };
  }
  return {
    picker: (
      <div className="mt-2 rounded-lg border border-neutral-700 p-2 text-xs text-neutral-300">
        <div className="flex flex-wrap items-center gap-2">
          {thumb(linked)}
          <span className="flex-1">
            From My Gear: <strong className="text-neutral-100">{gearItemLabel(linked)}</strong>
            {elsewhere.length > 0 && <span className="text-neutral-500"> &middot; also in {elsewhere.join(", ")}</span>}
          </span>
          <button type="button" onClick={() => onSet(undefined)} title="Take it out of this gear set (it stays in My Gear)" className={buttonClass}>
            Take out
          </button>
        </div>
        {others.length > 0 && (
          <div className="mt-2">
            <p className="mb-1.5 text-neutral-400">Or swap it for:</p>
            {choices}
          </div>
        )}
        <p className="mt-1.5 text-neutral-500">Editing it below changes it everywhere it&rsquo;s used.</p>
      </div>
    ),
  };
}
