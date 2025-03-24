import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShieldX } from "lucide-react";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  tutorName?: string;
}

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onConfirm,
  tutorName = "this tutor",
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex justify-center mb-4 -mt-2">
          <div className="bg-red-50 p-3 rounded-full">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl text-center">
            Reject {tutorName}
          </DialogTitle>
          <DialogDescription className="text-center">
            Please provide a reason for rejection. This will be sent to the
            tutor and cannot be changed later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-left font-medium">
                Reason for Rejection
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="resize-none min-h-[120px] bg-red-50/30 border-red-100 focus-visible:ring-red-200"
                required
              />
              <p className="text-xs text-gray-500 italic">
                Be clear and professional in your explanation. This feedback
                helps tutors understand why they were rejected.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-sm hover:shadow"
              disabled={!reason.trim()}
            >
              <ShieldX className="h-4 w-4 mr-2" />
              Reject Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
