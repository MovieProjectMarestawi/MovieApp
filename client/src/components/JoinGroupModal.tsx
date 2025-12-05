import { useState } from 'react';
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
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface JoinGroupModalProps {
  group: Group | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
}
// käytjä pystty viesti omistajalle
export function JoinGroupModal({ group, open, onClose, onConfirm }: JoinGroupModalProps) {
  const [message, setMessage] = useState('');
// Lähettää viestin parent-komponentille ja tyhjentää kentän
  const handleConfirm = () => {
    onConfirm(message);
    setMessage('');
  };
// Jos group = null, modal ei piirretä lainkaan
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
          
        {/* Viesti ryhmän omistajalle */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-zinc-300">
              Message to group owner (optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the group owner why you'd like to join..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
            />
          </div>
          {/* Ryhmän perustiedot */}
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
         {/* nappit: cancel ja sed request */}
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