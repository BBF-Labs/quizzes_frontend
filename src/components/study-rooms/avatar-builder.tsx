"use client";

import { useState, useMemo, memo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Palette,
  Smile,
  Glasses,
  Shirt,
  RefreshCw,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarBuilderProps {
  initialConfig?: Record<string, string>;
  onUpdate: (config: Record<string, string>) => void;
}

// Stored config uses plain string values. This converts to what DiceBear expects:
// - most keys take arrays of strings
// - accessories "none" → accessoriesProbability: 0
export function toDiceBearOptions(config: Record<string, string>) {
  const opts: Record<string, unknown> = {
    backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"],
  };
  const ARRAY_KEYS = ["top", "clothing", "hairColor", "clothesColor", "eyes", "eyebrows", "mouth", "skinColor", "accessories"];
  for (const key of ARRAY_KEYS) {
    if (key === "accessories") {
      if (config.accessories && config.accessories !== "none") {
        opts.accessories = [config.accessories];
        opts.accessoriesProbability = 100;
      } else {
        opts.accessoriesProbability = 0;
      }
    } else if (config[key]) {
      opts[key] = [config[key]];
    }
  }
  return opts;
}

const COLOR_CATEGORIES = new Set(["hairColor", "clothesColor", "skinColor"]);

const CATEGORIES = [
  { id: "top",          label: "Hair",          icon: User },
  { id: "hairColor",    label: "Hair Color",    icon: Palette },
  { id: "eyes",         label: "Eyes",          icon: Eye },
  { id: "eyebrows",     label: "Eyebrows",      icon: Sparkles },
  { id: "mouth",        label: "Mouth",         icon: Smile },
  { id: "clothing",     label: "Clothes",       icon: Shirt },
  { id: "clothesColor", label: "Clothes Color", icon: Palette },
  { id: "accessories",  label: "Accessories",   icon: Glasses },
  { id: "skinColor",    label: "Skin",          icon: Palette },
];

const OPTIONS: Record<string, string[]> = {
  top: [
    "bigHair", "bob", "bun", "curly", "curvy", "dreads", "frida", "fro", "froBand",
    "longButNotTooLong", "miaWallace", "shavedSides", "straight01", "straight02",
    "straightAndStrand", "dreads01", "dreads02", "frizzle", "shaggyMullet",
    "shortCurly", "shortFlat", "shortRound", "shortWaved", "sides",
    "theCaesar", "theCaesarAndSidePart", "turban", "hijab", "hat",
    "winterHat1", "winterHat02", "winterHat03", "winterHat04",
  ],
  accessories: [
    "none", "kurt", "prescription01", "prescription02", "round", "sunglasses", "wayfarers", "eyepatch",
  ],
  hairColor:    ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "e8e1e1", "f59797", "ecdcbf", "c93305"],
  clothing:     ["blazerAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt", "hoodie", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"],
  clothesColor: ["262e33", "65c9ff", "5199e4", "25557c", "e6e6e6", "929598", "3c4f5c", "b1e2ff", "a7ffc4", "ffafb9", "ff488e", "ff5c5c", "ffffff"],
  eyes:         ["closed", "cry", "default", "eyeRoll", "happy", "hearts", "side", "squint", "surprised", "wink", "winkWacky", "xDizzy"],
  eyebrows:     ["angry", "angryNatural", "default", "defaultNatural", "flatNatural", "raisedExcited", "raisedExcitedNatural", "sadConcerned", "sadConcernedNatural", "unibrowNatural", "upDown", "upDownNatural"],
  mouth:        ["concerned", "default", "disbelief", "eating", "grimace", "sad", "screamOpen", "serious", "smile", "tongue", "twinkle", "vomit"],
  skinColor:    ["614335", "ae5d29", "d08b5b", "edb98a", "ffd9c0", "f8d25c", "fd9841"],
};

const DEFAULT_CONFIG: Record<string, string> = {
  top: "shortFlat",
  hairColor: "4a312c",
  eyes: "default",
  eyebrows: "default",
  mouth: "smile",
  clothing: "shirtCrewNeck",
  clothesColor: "5199e4",
  accessories: "none",
  skinColor: "edb98a",
};

const PRESETS: Record<string, Record<string, string>> = {
  styleA: {
    top: "theCaesar",
    hairColor: "2c1b18",
    eyes: "default",
    eyebrows: "default",
    mouth: "smile",
    clothing: "shirtCrewNeck",
    clothesColor: "262e33",
    accessories: "none",
    skinColor: "ae5d29",
  },
  styleB: {
    top: "straight01",
    hairColor: "4a312c",
    eyes: "happy",
    eyebrows: "defaultNatural",
    mouth: "twinkle",
    clothing: "shirtScoopNeck",
    clothesColor: "ff488e",
    accessories: "none",
    skinColor: "edb98a",
  },
};

// Memoised thumbnail — only re-renders when its own opt or config changes
const AvatarThumb = memo(function AvatarThumb({
  field,
  opt,
  config,
  selected,
  onClick,
}: {
  field: string;
  opt: string;
  config: Record<string, string>;
  selected: boolean;
  onClick: () => void;
}) {
  const uri = useMemo(() => {
    const preview = toDiceBearOptions({ ...config, [field]: opt });
    return createAvatar(avataaars, preview).toDataUri();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opt, field, JSON.stringify(config)]);

  if (opt === "none") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "aspect-square rounded-(--radius) border-2 flex items-center justify-center transition-all hover:border-primary/60 text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground",
          selected ? "border-primary bg-primary/5 shadow-sm text-primary" : "border-border/30 bg-muted/20",
        )}
      >
        None
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-(--radius) border-2 p-0.5 transition-all hover:border-primary/60",
        selected ? "border-primary bg-primary/5 shadow-sm" : "border-border/30 bg-muted/20",
      )}
    >
      <img src={uri} alt={opt} className="size-full object-contain" />
      <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[6px] font-mono text-white opacity-0 transition-opacity group-hover:opacity-100 truncate px-0.5 uppercase">
        {opt.replace(/([A-Z])/g, " $1").trim()}
      </div>
    </button>
  );
});

export function AvatarBuilder({ initialConfig, onUpdate }: AvatarBuilderProps) {
  const [config, setConfig] = useState<Record<string, string>>(
    initialConfig && Object.keys(initialConfig).length > 0 ? initialConfig : DEFAULT_CONFIG,
  );
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);

  const previewUri = useMemo(
    () => createAvatar(avataaars, toDiceBearOptions(config)).toDataUri(),
    [config],
  );

  const updateField = (field: string, value: string) => {
    const next = { ...config, [field]: value };
    setConfig(next);
    onUpdate(next);
  };

  const applyPreset = (key: string) => {
    const next = { ...PRESETS[key] };
    setConfig(next);
    onUpdate(next);
  };

  const randomize = () => {
    const next: Record<string, string> = {};
    for (const key of Object.keys(OPTIONS)) {
      const opts = OPTIONS[key];
      next[key] = key === "accessories" && Math.random() < 0.6
        ? "none"
        : opts.filter((o) => o !== "none")[Math.floor(Math.random() * (opts.filter((o) => o !== "none").length))];
    }
    setConfig(next);
    onUpdate(next);
  };

  const currentCat = CATEGORIES.find((c) => c.id === activeCat)!;
  const isColor = COLOR_CATEGORIES.has(activeCat);

  return (
    <div className="flex flex-col gap-0">

      {/* ── TOP: preview + quick actions ── */}
      <div className="flex items-center gap-6 border-b border-border/50 bg-muted/10 px-5 py-5">
        {/* Avatar preview */}
        <div
          className="relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-border/50 bg-background shadow-inner group"
          onClick={randomize}
          title="Click to randomize"
        >
          <img src={previewUri} alt="Preview" className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-full">
            <RefreshCw className="size-5 text-primary animate-spin" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Quick styles</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("styleA")}
              className="rounded-(--radius) font-mono text-[9px] uppercase h-8 px-4"
            >
              Style A
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("styleB")}
              className="rounded-(--radius) font-mono text-[9px] uppercase h-8 px-4"
            >
              Style B
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={randomize}
              className="rounded-(--radius) font-mono text-[9px] uppercase h-8 px-4 gap-1.5 text-muted-foreground"
            >
              <RefreshCw className="size-3" /> Random
            </Button>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: category tab strip (horizontal scroll) ── */}
      <div className="flex gap-1 overflow-x-auto border-b border-border/50 bg-muted/5 px-3 py-2 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const active = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-(--radius) px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider transition-all",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <cat.icon className="size-3 shrink-0" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── BOTTOM: options grid ── */}
      <ScrollArea className="h-64">
        <div className="p-4">
          {isColor ? (
            /* Colour swatches */
            <div className="flex flex-wrap gap-3">
              {OPTIONS[activeCat]?.map((hex) => (
                <button
                  key={hex}
                  onClick={() => updateField(activeCat, hex)}
                  title={`#${hex}`}
                  className={cn(
                    "size-9 rounded-full border-2 transition-all hover:scale-110",
                    config[activeCat] === hex
                      ? "border-primary scale-110 ring-2 ring-primary/30 shadow-sm"
                      : "border-border/40",
                  )}
                  style={{ backgroundColor: `#${hex}` }}
                />
              ))}
            </div>
          ) : (
            /* Avatar thumbnail grid */
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {OPTIONS[activeCat]?.map((opt) => (
                <AvatarThumb
                  key={opt}
                  field={activeCat}
                  opt={opt}
                  config={config}
                  selected={config[activeCat] === opt}
                  onClick={() => updateField(activeCat, opt)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Active category label */}
      <div className="border-t border-border/50 bg-muted/10 px-4 py-2">
        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {currentCat.label} — {isColor ? "pick a colour" : `${OPTIONS[activeCat]?.length ?? 0} options`}
        </p>
      </div>
    </div>
  );
}
