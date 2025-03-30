import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldCheck } from 'lucide-react';

interface ApprovalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tutorName?: string;
}

export const ApprovalConfirmationModal: React.FC<
  ApprovalConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, tutorName = 'this tutor' }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <div className="flex justify-center mb-4 -mt-2">
          <div className="bg-green-100 p-3 rounded-full">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-xl text-center">
            Approve {tutorName}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to approve {tutorName}? They will be able to
            access the platform as a verified tutor and interact with students.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex justify-center gap-4">
          <AlertDialogCancel
            onClick={onClose}
            className="border-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-all"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 shadow-sm hover:shadow"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Approve Tutor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
