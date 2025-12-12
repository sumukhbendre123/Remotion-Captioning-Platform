"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, Trash2, Plus } from "lucide-react";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/hooks/use-toast";

export function EditCaptionsDialog() {
  const { captions, setCaptions } = useVideoStore();
  const { toast } = useToast();
  const [editedCaptions, setEditedCaptions] = useState(captions);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    setCaptions(editedCaptions);
    setIsOpen(false);
    toast({
      title: "Captions Updated",
      description: `Successfully updated ${editedCaptions.length} captions`,
    });
  };

  const handleEditText = (index: number, newText: string) => {
    const updated = [...editedCaptions];
    updated[index] = {
      ...updated[index],
      text: newText,
    };
    setEditedCaptions(updated);
  };

  const handleEditTiming = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const updated = [...editedCaptions];
    const numValue = parseFloat(value) || 0;
    updated[index] = {
      ...updated[index],
      [field]: numValue,
    };
    setEditedCaptions(updated);
  };

  const handleDelete = (index: number) => {
    const updated = editedCaptions.filter((_, i) => i !== index);
    setEditedCaptions(updated);
    toast({
      title: "Caption Deleted",
      description: "Caption removed successfully",
    });
  };

  const handleAdd = () => {
    const lastCaption = editedCaptions[editedCaptions.length - 1];
    const newCaption = {
      text: "New caption",
      start: lastCaption ? lastCaption.end : 0,
      end: lastCaption ? lastCaption.end + 3 : 3,
      words: [],
    };
    setEditedCaptions([...editedCaptions, newCaption]);
  };

  const handleReset = () => {
    setEditedCaptions(captions);
    toast({
      title: "Changes Discarded",
      description: "Reverted to original captions",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Edit className="mr-2 w-4 h-4" />
          Edit Captions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Captions</DialogTitle>
          <DialogDescription>
            Manually edit caption text and timing. Changes will update the
            preview immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Caption List */}
          {editedCaptions.map((caption, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg bg-gray-50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm text-gray-600">
                  Caption {index + 1}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Text */}
              <div>
                <Label htmlFor={`caption-text-${index}`} className="text-xs">
                  Text
                </Label>
                <Input
                  id={`caption-text-${index}`}
                  value={caption.text}
                  onChange={(e) => handleEditText(index, e.target.value)}
                  className="mt-1"
                  placeholder="Enter caption text"
                />
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`caption-start-${index}`} className="text-xs">
                    Start Time (seconds)
                  </Label>
                  <Input
                    id={`caption-start-${index}`}
                    type="number"
                    step="0.1"
                    value={caption.start.toFixed(2)}
                    onChange={(e) =>
                      handleEditTiming(index, "start", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`caption-end-${index}`} className="text-xs">
                    End Time (seconds)
                  </Label>
                  <Input
                    id={`caption-end-${index}`}
                    type="number"
                    step="0.1"
                    value={caption.end.toFixed(2)}
                    onChange={(e) =>
                      handleEditTiming(index, "end", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Duration Display */}
              <p className="text-xs text-gray-500">
                Duration: {(caption.end - caption.start).toFixed(2)}s
              </p>
            </div>
          ))}

          {/* Add New Caption */}
          <Button
            variant="outline"
            onClick={handleAdd}
            className="w-full border-dashed"
          >
            <Plus className="mr-2 w-4 h-4" />
            Add New Caption
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset Changes
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="mr-2 w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
