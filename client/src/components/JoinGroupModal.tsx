import { Group } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface JoinGroupModalProps {
  group: Group | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
}

export function JoinGroupModal({ group, open, onClose, onConfirm }: JoinGroupModalProps) {
  const handleConfirm = () => {
    onConfirm('');
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Join {group.name}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Send a request to join this group. The group owner will review your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          <div className="bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-400">Group Owner:</span>
              <span className="text-white">{group.owner}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Members:</span>
              <span className="text-white">{group.members}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
