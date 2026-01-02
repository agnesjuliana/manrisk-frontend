import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  open: boolean;
  itemName?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  itemName,
  title = "Konfirmasi Penghapusan",
  description = "Tindakan ini tidak dapat dibatalkan",
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(openState) => !openState && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b border-red-100 pb-4">
          <DialogTitle className="text-xl text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus item berikut?
          </p>
          {itemName && (
            <p className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-900 font-medium">
              {itemName}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-red-100 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
