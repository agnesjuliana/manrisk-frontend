"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "danger";
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isLoading = false,
  onConfirm,
  variant = "default",
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="border-b border-sky-100 pb-4">
          <DialogTitle className="text-xl text-gray-900">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {message && (
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
            <p className="text-sm text-gray-900">{message}</p>
          </div>
        )}

        <DialogFooter className="border-t border-sky-100 pt-4 mt-6">
          <div className="flex justify-end w-full gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-900"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-sky-600 hover:bg-sky-700 text-white"
              }
            >
              {isLoading ? "Memproses..." : confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
