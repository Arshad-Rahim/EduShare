import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  tutorName: string;
}

export const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  tutorName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{tutorName}'s Verification Document</DialogTitle>
        </DialogHeader>
        <div className="mt-4 mx-auto overflow-hidden rounded-md">
          {documentUrl.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={documentUrl}
              title="Verification Document"
              className="w-full h-[80vh]"
            />
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={documentUrl}
                alt="Verification Document"
                className="max-h-[80vh] object-contain rounded-md shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                  target.alt = 'Error loading document';
                }}
              />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.open(documentUrl, '_blank')}
              >
                Open Full Size
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
