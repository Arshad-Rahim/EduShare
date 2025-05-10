import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClipLoader } from 'react-spinners';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'sm:max-w-[425px] rounded-lg shadow-lg p-6 bg-white border border-gray-200',
          'transition-all duration-300 ease-in-out'
        )}
      >
        <DialogHeader className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-2 text-gray-600 text-sm">
          {description}
        </DialogDescription>
        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400',
              'transition-colors duration-200'
            )}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 bg-red-600 hover:bg-red-700 text-white',
              'transition-colors duration-200'
            )}
          >
            {isLoading ? <ClipLoader size={20} color="#ffffff" /> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};