"use client";

import React, { useState } from "react";
import { FileUp, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddSessionMaterial } from "@/hooks";
import type { ZMaterial } from "@/types/session";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface MaterialManagerProps {
  sessionId: string;
  materials: ZMaterial[];
  courseId: string;
}

export function MaterialManager({
  sessionId,
  materials,
  courseId,
}: MaterialManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: addMaterial } = useAddSessionMaterial(sessionId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload the raw file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "sessions");

      const uploadRes = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadId = uploadRes.data.data.id;

      // 2. Create a Material from the Upload
      const materialRes = await api.post("/materials", {
        title: file.name,
        uploadId,
        type: "pdf", // Defaulting to pdf for now, could detect from file extension
        courseId,
      });

      const materialId = materialRes.data.data.id;

      // 3. Associate Material with Session
      addMaterial(materialId);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-none bg-accent/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Session Materials</span>
          <div className="relative">
            <input
              type="file"
              id="material-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label htmlFor="material-upload">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 cursor-pointer"
                disabled={isUploading}
                asChild
              >
                <span>
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileUp className="h-3.5 w-3.5" />
                  )}
                  Upload
                </span>
              </Button>
            </label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {materials.length === 0 ? (
          <div className="text-xs text-muted-foreground italic py-2">
            No materials uploaded yet.
          </div>
        ) : (
          <div className="grid gap-2">
            {materials.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <File className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs truncate font-medium">
                    {m.title}
                  </span>
                </div>
                {!m.isProcessed && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 px-1 animate-pulse"
                  >
                    Processing
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
