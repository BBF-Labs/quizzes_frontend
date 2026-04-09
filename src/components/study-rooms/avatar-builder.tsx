"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarBuilderProps {
  initialConfig?: Record<string, any>;
  onUpdate: (config: Record<string, any>) => void;
}

const CATEGORIES = [
  { id: "top", label: "Hair/Hat", icon: User },
  { id: "hairColor", label: "Hair Color", icon: Palette },
  { id: "eyes", label: "Eyes", icon: Eye },
  { id: "mouth", label: "Mouth", icon: Smile },
  { id: "clothes", label: "Clothes", icon: Shirt },
  { id: "accessories", label: "Accessories", icon: Glasses },
  { id: "skinColor", label: "Skin", icon: Palette },
];

const OPTIONS: Record<string, string[]> = {
  top: [
    "longHairBigHair", "longHairBob", "longHairBun", "longHairCurly", "longHairCurvy", 
    "longHairDreads", "longHairFrida", "longHairFro", "longHairFroBand", "longHairNotTooLong", 
    "longHairShavedSides", "longHairMiaWallace", "longHairStraight", "longHairStraight2", 
    "longHairStraightStrand", "shortHairDreads01", "shortHairDreads02", "shortHairFrizzle", 
    "shortHairShaggyMullet", "shortHairShortCurly", "shortHairShortFlat", "shortHairShortRound", 
    "shortHairShortWaved", "shortHairSides", "shortHairTheCaesar", "shortHairTheCaesarSidePart", 
    "turban", "hijab", "hat", "winterHat1", "winterHat2", "winterHat3", "winterHat4"
  ],
  accessories: ["blank", "kurt", "prescription01", "prescription02", "round", "sunglasses", "wayfarers"],
  hairColor: ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b070", "e8e1e1", "f59797", "ecdcbf", "c93305"],
  clothes: ["blazeAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt", "hood", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"],
  clothesColor: ["262e33", "65c9ff", "5199e4", "25557c", "e6e6e6", "929598", "353535", "ff488e", "ff5c5c", "fff500", "51beaf", "fcab58", "ffffbc"],
  eyes: ["close", "cry", "default", "dizzy", "eyeRoll", "happy", "hearts", "side", "squint", "surprised", "wink", "winkWacky"],
  eyebrows: ["angry", "angryNatural", "default", "defaultNatural", "flatNatural", "raisedExcited", "raisedExcitedNatural", "sadHelpful", "unibrowNatural", "upDown", "upDownNatural"],
  mouth: ["concerned", "default", "disbelief", "eating", "grimace", "sad", "screamOpen", "serious", "smile", "tongue", "twinkle", "vomit"],
  skinColor: ["614335", "ae5d29", "d08b5b", "edb98a", "f2d3b1", "ffd281", "ffdbb4"],
};

export function AvatarBuilder({ initialConfig, onUpdate }: AvatarBuilderProps) {
  const [config, setConfig] = useState<Record<string, any>>(initialConfig || { seed: "avatar" });
  const [previewUri, setPreviewUri] = useState("");

  useEffect(() => {
    const svg = createAvatar(avataaars, {
      ...config,
      backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"],
    }).toString();
    setPreviewUri(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  }, [config]);

  const updateField = (field: string, value: string) => {
    const next = { ...config, [field]: value };
    setConfig(next);
    onUpdate(next);
  };

  const randomize = () => {
    const next: Record<string, any> = { seed: Math.random().toString() };
    Object.keys(OPTIONS).forEach(key => {
      const opts = OPTIONS[key];
      next[key] = opts[Math.floor(Math.random() * opts.length)];
    });
    setConfig(next);
    onUpdate(next);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row h-full max-h-[80vh]">
      {/* Preview Section */}
      <div className="flex flex-col items-center justify-center gap-4 border p-6 rounded-(--radius) bg-muted/30 md:w-1/3">
        <div className="relative size-48 rounded-full border-4 border-primary/20 bg-background shadow-xl overflow-hidden group">
          <img src={previewUri} alt="Avatar Preview" className="size-full object-cover p-2" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <RefreshCw className="text-white size-8 animate-spin-slow cursor-pointer" onClick={randomize} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={randomize} className="rounded-(--radius) gap-2">
          <RefreshCw className="size-4" /> Randomize
        </Button>
      </div>

      {/* Editor Section */}
      <div className="flex-1 overflow-hidden flex flex-col border rounded-(--radius) bg-card shadow-sm">
        <Tabs defaultValue="top" className="flex flex-col h-full">
          <div className="border-b px-2 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-12 gap-2">
              {CATEGORIES.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="rounded-(--radius) data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <cat.icon className="size-4" />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-4">
            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-0 outline-none">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {OPTIONS[cat.id]?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField(cat.id, opt)}
                      className={cn(
                        "relative aspect-square rounded-(--radius) border-2 transition-all p-1 group hover:border-primary/50 overflow-hidden",
                        config[cat.id] === opt ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                      )}
                    >
                      <img 
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          createAvatar(avataaars, { ...config, [cat.id]: opt }).toString()
                        )}`}
                        alt={opt}
                        className="size-full object-contain"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center truncate px-1">
                        {opt}
                      </div>
                    </button>
                  ))}
                  {cat.id.toLowerCase().includes("color") && OPTIONS[`${cat.id}s`]?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField(cat.id, opt)}
                      className={cn(
                        "size-10 rounded-full border-2 transition-all shadow-sm",
                        config[cat.id] === opt ? "border-primary scale-110" : "border-muted"
                      )}
                      style={{ backgroundColor: `#${opt}` }}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
