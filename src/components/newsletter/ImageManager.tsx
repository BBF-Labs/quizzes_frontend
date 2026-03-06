"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ImageIcon, ExternalLink, X, Upload, Check, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { INewsletterImage, useNewsletterImages } from "@/hooks/use-campaigns";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface ImageManagerProps {
  images: INewsletterImage[];
  onChange: (images: INewsletterImage[]) => void;
  disabled?: boolean;
}

export function ImageManager({ images, onChange, disabled }: ImageManagerProps) {
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const [isUploading, setIsUploading] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIndexRef = useRef<number | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: galleryData, isLoading: isLoadingGallery } = useNewsletterImages({ 
    page, 
    limit: 12 
  });

  const addImage = () => {
    onChange([...images, { url: "", altText: "" }]);
  };

  const updateImage = (i: number, field: keyof INewsletterImage, value: any) => {
    onChange(images.map((img, idx) => idx === i ? { ...img, [field]: value } : img));
  };

  const removeImage = (i: number) => {
    const nextPending = { ...pendingFiles };
    delete nextPending[i];
    setPendingFiles(nextPending);
    onChange(images.filter((_, idx) => idx !== i));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFiles(prev => ({ ...prev, [i]: file }));
    }
  };

  const triggerUpload = (i: number) => {
    activeIndexRef.current = i;
    fileInputRef.current?.click();
  };

  const confirmUpload = async (i: number) => {
    const file = pendingFiles[i];
    if (!file) return;

    if (!images[i].altText.trim()) {
      toast.error("Alt text is required for AI processing & accessibility.");
      return;
    }

    setIsUploading(prev => ({ ...prev, [i]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "newsletter");

      const res = await api.post("/system/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const { url, filename, mimetype, size } = res.data.data;
      
      // Update the parent state
      const nextImages = [...images];
      nextImages[i] = {
        ...nextImages[i],
        url,
        filename,
        mimetype,
        size
      };
      onChange(nextImages);

      // Clear pending
      const nextPending = { ...pendingFiles };
      delete nextPending[i];
      setPendingFiles(nextPending);
      
      toast.success("Identity verified and asset secured.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Secure upload failed.");
    } finally {
      setIsUploading(prev => ({ ...prev, [i]: false }));
    }
  };

  const cancelPending = (i: number) => {
    const nextPending = { ...pendingFiles };
    delete nextPending[i];
    setPendingFiles(nextPending);
  };

  return (
    <div className="space-y-6">
      {/* Hidden Global Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => activeIndexRef.current !== null && handleFileSelect(e, activeIndexRef.current)}
        className="hidden"
        accept="image/*"
      />

      {/* Header Style Label */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-border/30" />
        <div className="bg-secondary/40 border border-border/50 px-2.5 py-1 flex items-center gap-2">
          <ImageIcon className="size-3 text-primary" />
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-primary/80">Asset Library</span>
        </div>
        <div className="h-px flex-1 bg-border/30" />
        {!disabled && (
          <div className="flex items-center gap-2 ml-2">
            <Sheet open={galleryOpen} onOpenChange={setGalleryOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="rounded-none font-mono text-[9px] tracking-widest uppercase border-border/40 text-muted-foreground bg-secondary/10 hover:bg-secondary h-6"
                >
                  <Search className="size-3" /> Browse System Gallery
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                <SheetHeader>
                  <SheetTitle className="text-xs font-mono tracking-widest uppercase">System Visual Assets</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4 h-full flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                      {isLoadingGallery ? (
                        <div className="grid grid-cols-2 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-none bg-secondary/30" />
                          ))}
                        </div>
                                            ) : !galleryData?.data || galleryData.data.length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Library Empty</p>
                        </div>
                                              ) : (
                        <div className="grid grid-cols-2 gap-3 pb-20">
                          {galleryData?.data?.map((asset) => (
                            <div 
                              key={asset._id}
                              onClick={() => {
                                onChange([...images, { url: asset.url, altText: asset.altText }]);
                                setGalleryOpen(false);
                                toast.success("Asset imported to campaign context.");
                              }}
                              className="group relative aspect-square bg-secondary/20 border border-border/40 cursor-pointer overflow-hidden hover:border-primary/50 transition-all"
                            >
                              <img 
                                src={asset.url} 
                                alt={asset.altText} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                <p className="text-[8px] font-mono text-white truncate uppercase tracking-widest leading-none mb-1">{asset.filename || "Static Asset"}</p>
                                <p className="text-[7px] font-mono text-muted-foreground truncate leading-none">{asset.altText}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  
                  {/* Gallery Pagination */}
                  {(galleryData?.total || 0) > 12 && (
                    <div className="flex items-center justify-between border-t border-border/30 pt-4 pb-8 bg-background">
                       <Button 
                         variant="outline" 
                         size="xs" 
                         disabled={page === 1}
                         onClick={() => setPage(p => p - 1)}
                         className="rounded-none text-[8px] h-6 uppercase font-mono tracking-widest"
                       >
                         PREV
                       </Button>
                       <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                         Page {page}
                       </span>
                       <Button 
                         variant="outline" 
                         size="xs" 
                         disabled={(galleryData?.total || 0) <= page * 12}
                         onClick={() => setPage(p => p + 1)}
                         className="rounded-none text-[8px] h-6 uppercase font-mono tracking-widest"
                       >
                         NEXT
                       </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              type="button"
              onClick={addImage}
              variant="outline"
              size="xs"
              className="rounded-none font-mono text-[9px] tracking-widest uppercase border-primary/40 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground h-6"
            >
              <Plus className="size-3" /> New Image
            </Button>
          </div>
        )}
      </div>

      {images.length === 0 ? (
        <div className="border border-dashed border-border/30 py-8 flex flex-col items-center justify-center opacity-30">
           <ImageIcon className="size-5 mb-2 text-muted-foreground" />
           <p className="text-[9px] font-mono uppercase tracking-[0.2em]">No visual assets defined</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {images.map((img, i) => {
              const pending = pendingFiles[i];
              const previewUrl = pending ? URL.createObjectURL(pending) : img.url;
              const uploading = isUploading[i];

              return (
                <motion.div
                  key={`img-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative border border-border/40 bg-background/40 p-3 space-y-3"
                >
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 size-5 bg-background border border-border rounded-none hover:border-destructive hover:text-destructive flex items-center justify-center transition-all z-10"
                      title="Remove Image"
                    >
                      <X className="size-3" />
                    </button>
                  )}

                  <div className="flex gap-4">
                    {/* Preview Wrap */}
                    <div 
                      onClick={() => !disabled && !img.url && !pending && triggerUpload(i)}
                      className={cn(
                        "size-24 bg-black/20 border border-border/20 flex-shrink-0 overflow-hidden flex items-center justify-center relative group/preview transition-all",
                        !img.url && !pending && !disabled && "cursor-pointer hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      {previewUrl ? (
                        <>
                          <img 
                            src={previewUrl} 
                            alt={img.altText} 
                            className={cn(
                              "w-full h-full object-cover transition-all duration-700 group-hover/preview:scale-110",
                              !pending && "grayscale group-hover/preview:grayscale-0"
                            )}
                          />
                          {!pending && img.url && (
                             <>
                               <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                               <a 
                                 href={img.url} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="absolute inset-x-0 bottom-0 py-1 bg-black/60 text-[8px] font-mono text-white text-center translate-y-full group-hover/preview:translate-y-0 transition-transform flex items-center justify-center gap-1"
                               >
                                 OPEN <ExternalLink className="size-2" />
                               </a>
                             </>
                          )}
                          {pending && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <ShieldCheck className="size-6 text-primary animate-pulse" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-20 group-hover/preview:opacity-40 transition-opacity">
                          <Upload className="size-4" />
                          <span className="text-[7px] font-mono uppercase tracking-widest text-center px-1">Upload Required</span>
                        </div>
                      )}

                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                          <RotateCcw className="size-4 text-primary animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* URL Source */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[8px] font-mono uppercase text-muted-foreground/60 tracking-wider">Asset Protocol / URL</label>
                        </div>
                        <Input
                          value={img.url}
                          onChange={(e) => updateImage(i, "url", e.target.value)}
                          disabled={disabled || !!pending}
                          placeholder="https://cdn.qz.tech/asset.jpg"
                          className="h-7 text-[10px] font-mono rounded-none bg-secondary/10 border-border/30 focus:border-primary/50 transition-colors"
                        />
                      </div>

                      {/* Alt Text */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-muted-foreground/60 tracking-wider">AI Narrative Alt Text</label>
                        <Input
                          value={img.altText}
                          onChange={(e) => updateImage(i, "altText", e.target.value)}
                          disabled={disabled}
                          placeholder="Explain for Z..."
                          className="h-7 text-[10px] font-mono rounded-none bg-secondary/10 border-border/30 focus:border-primary/50 transition-colors"
                        />
                      </div>

                      {/* Pending Actions */}
                      <AnimatePresence>
                        {pending && !uploading && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-2 pt-1"
                          >
                            <Button
                              type="button"
                              onClick={() => confirmUpload(i)}
                              size="xs"
                              className="flex-1 rounded-none h-6 font-mono text-[8px] uppercase tracking-widest"
                            >
                              <Check className="size-2.5 mr-1" /> Confirm Upload
                            </Button>
                            <Button
                              type="button"
                              onClick={() => cancelPending(i)}
                              variant="outline"
                              size="xs"
                              className="rounded-none h-6 font-mono text-[8px] uppercase tracking-widest px-2"
                            >
                              Cancel
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
