import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { groupsAPI } from '../services/api';

interface EditGroupModalProps {
  open: boolean;
  onClose: () => void;
  group: {
    id: number;
    name: string;
    description?: string;
  } | null;
  onSuccess?: () => void;
}

export function EditGroupModal({ open, onClose, group, onSuccess }: EditGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Kun modal avataan, täytetään kentät valitun ryhmän tiedoilla
  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setDescription(group.description || '');
    }
  }, [group, open]);
  
  // Lähettää päivitetyt ryhmätiedot API:lle + validoinnit
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

    if (!group) return;

    setLoading(true);
    try {
      await groupsAPI.update(group.id, name.trim(), description.trim() || undefined);
      toast.success('Group updated successfully!');
      onClose(); // sulke modelin
      onSuccess?.(); //päivitä ryhmälistan
    } catch (error: any) {
      console.error('Failed to update group:', error);
      setError(error.message || 'Failed to update group');
    } finally {
      setLoading(false);
    }
  };
// Sulkee modaalin vain jos ei ole kesken prosessia
  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Group</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update your group information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-group-name" className="text-zinc-300">
              Group Name *
            </Label>
            <Input
              id="edit-group-name"
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
            <Label htmlFor="edit-group-description" className="text-zinc-300">
              Description (Optional)
            </Label>
            <Textarea
              id="edit-group-description"
              placeholder="Tell us about your group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Updating...' : 'Update Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
