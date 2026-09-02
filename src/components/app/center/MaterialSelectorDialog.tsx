"use client";

import { MaterialPickerDialog } from "@/components/common/MaterialPickerDialog";
import { useAddAppMaterial } from "@/hooks/app/use-app-actions";

interface MaterialSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  alreadyAddedIds?: string[];
}

export function MaterialSelectorDialog({
  isOpen,
  onOpenChange,
  sessionId,
  alreadyAddedIds = [],
}: MaterialSelectorDialogProps) {
  const { mutate: addMaterial } = useAddAppMaterial(sessionId);

  const handleSelect = (materialId: string) => {
    addMaterial(materialId, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <MaterialPickerDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSelect={handleSelect}
      allowUpload={false}
      excludeIds={alreadyAddedIds}
      title="Add from Library"
      description="Select a material to add to this session."
      confirmLabel="Add to Session"
    />
  );
}
