import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

// Modal-komponentti
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
// ilmoitus sinne onnistumine tai virheestä
import { toast } from 'sonner';
// api kustus group luomiseen
import { groupsAPI } from '../services/api';

interface CreateGroupModalProps {
  open: boolean;  // kertoo onko model auki
  onClose: () => void;  // sulkefunktio
  onSuccess?: () => void; // call group liuonnin jälken
}
  // Lomakkeen kenttien tilat
export function CreateGroupModal({ open, onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    // Lomakkeen lähetys
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    if (name.trim().length < 3) {
      setError('Group name must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
     // API kutsu uuden ryhmän luomiseen
      await groupsAPI.create(name.trim(), description.trim() || undefined);
      toast.success('Group created successfully!');
      setName('');
      setDescription('');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create group:', error);
      setError(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };
  // Modal sulkeminen ja lomakkeen resetointi
  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Group</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Start a new movie community and connect with fellow cinephiles
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Virheilmoitus */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {/* Nimi-kenttä */}
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-zinc-300">
              Group Name *
            </Label>
            <Input
              id="group-name"
              type="text"
              placeholder="e.g., Sci-Fi Movie Lovers"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              required
              minLength={3}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-description" className="text-zinc-300">
              Description (Optional)
            </Label>
            <Textarea
              id="group-description"
              placeholder="Tell us about your group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              disabled={loading}
            />
          </div>
           {/* Napit */}
          <div className="flex gap-3 pt-4">
            {/* perutta Napit */}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            {/* lähetys */}
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
