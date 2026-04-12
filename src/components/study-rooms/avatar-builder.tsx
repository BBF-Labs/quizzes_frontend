"use client";

import { useState, useMemo, memo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Categories that render colour swatches instead of avatar thumbnails
const COLOR_CATEGORIES = new Set(["hairColor", "clothesColor", "skinColor"]);

const CATEGORIES = [
  { id: "top",          label: "Hair / Hat",    icon: User },
  { id: "hairColor",    label: "Hair Colour",   icon: Palette },
  { id: "eyes",         label: "Eyes",          icon: Eye },
  { id: "eyebrows",     label: "Eyebrows",      icon: Sparkles },
  { id: "mouth",        label: "Mouth",         icon: Smile },
  { id: "clothing",     label: "Clothes",       icon: Shirt },
  { id: "clothesColor", label: "Clothes Colour",icon: Palette },
  { id: "accessories",  label: "Accessories",   icon: Glasses },
  { id: "skinColor",    label: "Skin",          icon: Palette },
];

// Exact values from @dicebear/collection avataaars schema
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
  hairColor:   ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "e8e1e1", "f59797", "ecdcbf", "c93305"],
  clothing:    ["blazerAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt", "hoodie", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"],
  clothesColor:["262e33", "65c9ff", "5199e4", "25557c", "e6e6e6", "929598", "3c4f5c", "b1e2ff", "a7ffc4", "ffafb9", "ff488e", "ff5c5c", "ffffff"],
  eyes:        ["closed", "cry", "default", "eyeRoll", "happy", "hearts", "side", "squint", "surprised", "wink", "winkWacky", "xDizzy"],
  eyebrows:    ["angry", "angryNatural", "default", "defaultNatural", "flatNatural", "raisedExcited", "raisedExcitedNatural", "sadConcerned", "sadConcernedNatural", "unibrowNatural", "upDown", "upDownNatural"],
  mouth:       ["concerned", "default", "disbelief", "eating", "grimace", "sad", "screamOpen", "serious", "smile", "tongue", "twinkle", "vomit"],
  skinColor:   ["614335", "ae5d29", "d08b5b", "edb98a", "ffd9c0", "f8d25c", "fd9841"],
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
          "group relative aspect-square overflow-hidden rounded-(--radius) border-2 flex items-center justify-center transition-all hover:border-primary/60",
          selected ? "border-primary bg-primary/5 shadow-md" : "border-border/20 bg-muted/30",
        )}
      >
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">None</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-(--radius) border-2 p-1 transition-all hover:border-primary/60",
        selected ? "border-primary bg-primary/5 shadow-md" : "border-border/20 bg-muted/30",
      )}
    >
      <img src={uri} alt={opt} className="size-full object-contain" />
      <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[7px] text-white opacity-0 transition-opacity group-hover:opacity-100 truncate px-1">
        {opt.replace(/([A-Z])/g, " $1").trim()}
      </div>
    </button>
  );
});

export function AvatarBuilder({ initialConfig, onUpdate }: AvatarBuilderProps) {
  const [config, setConfig] = useState<Record<string, string>>(
    initialConfig && Object.keys(initialConfig).length > 0 ? initialConfig : DEFAULT_CONFIG,
  );
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

  const previewUri = useMemo(() => {
    return createAvatar(avataaars, toDiceBearOptions(config)).toDataUri();
  }, [config]);

  const updateField = (field: string, value: string) => {
    const next = { ...config, [field]: value };
    setConfig(next);
    onUpdate(next);
  };

  const applyPreset = (presetKey: string) => {
    const next = { ...PRESETS[presetKey] };
    setConfig(next);
    onUpdate(next);
  };

  const randomize = () => {
    const next: Record<string, string> = {};
    for (const key of Object.keys(OPTIONS)) {
      const opts = OPTIONS[key];
      // For accessories, bias toward "none" so random avatars don't always have glasses
      if (key === "accessories") {
        next[key] = Math.random() < 0.6 ? "none" : opts.filter(o => o !== "none")[Math.floor(Math.random() * (opts.length - 1))];
      } else {
        next[key] = opts[Math.floor(Math.random() * opts.length)];
      }
    }
    setConfig(next);
    onUpdate(next);
  };

  return (
    <div className="flex flex-col md:flex-row h-full max-h-[80vh] gap-0">
      {/* Preview panel */}
      <div className="flex flex-col items-center justify-center gap-5 border-b md:border-b-0 md:border-r border-border/50 p-8 md:w-56 shrink-0 bg-muted/20">
        <div
          className="relative size-40 overflow-hidden rounded-full border-2 border-border/50 bg-background shadow-inner cursor-pointer group"
          onClick={randomize}
          title="Click to randomize"
        >
          <img src={previewUri} alt="Avatar preview" className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            <RefreshCw className="size-7 text-primary animate-spin" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("styleA")}
            className="rounded-(--radius) font-mono text-[9px] uppercase tracking-wider h-8"
          >
            Style A
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("styleB")}
            className="rounded-(--radius) font-mono text-[9px] uppercase tracking-wider h-8"
          >
            Style B
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={randomize}
          className="w-full rounded-(--radius) gap-2 text-[9px] font-mono uppercase tracking-wider text-muted-foreground"
        >
          <RefreshCw className="size-3" /> Randomize
        </Button>
      </div>

      {/* Editor panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          {/* Tab strip */}
          <div className="border-b border-border/50 px-2 overflow-x-auto no-scrollbar bg-muted/10">
            <TabsList className="h-12 gap-1 bg-transparent">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-(--radius) gap-1.5 px-3 text-[9px] font-mono uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <cat.icon className="size-3 shrink-0" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab content */}
          <ScrollArea className="flex-1">
            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-0 p-4 outline-none">
                {activeTab === cat.id && (
                  COLOR_CATEGORIES.has(cat.id) ? (
                    <div className="flex flex-wrap gap-3 p-1">
                      {OPTIONS[cat.id]?.map((hex) => (
                        <button
                          key={hex}
                          onClick={() => updateField(cat.id, hex)}
                          title={`#${hex}`}
                          className={cn(
                            "size-10 rounded-full border-2 transition-all shadow-sm hover:scale-110",
                            config[cat.id] === hex
                              ? "border-primary scale-110 ring-2 ring-primary/30"
                              : "border-border/40",
                          )}
                          style={{ backgroundColor: `#${hex}` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {OPTIONS[cat.id]?.map((opt) => (
                        <AvatarThumb
                          key={opt}
                          field={cat.id}
                          opt={opt}
                          config={config}
                          selected={config[cat.id] === opt}
                          onClick={() => updateField(cat.id, opt)}
                        />
                      ))}
                    </div>
                  )
                )}
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
