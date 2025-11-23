import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { groupsAPI } from '../services/api';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface JoinRequest {
  id: number;
  group_id: number;
  user_id: number;
  user_email: string;
  group_name: string;
  requested_at: string;
  status: string;
}

export function NotificationDropdown() {
  const { isLoggedIn } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewedRequests, setViewedRequests] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      const data = await groupsAPI.getAllPendingRequests();
      setRequests(data.requests || []);
    } catch (error: any) {
      // Silently fail if not authorized or other errors
      if (error.status !== 403 && error.status !== 401) {
        console.error('Failed to fetch notifications:', error);
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch immediately
      fetchNotifications();

      // Poll every 10 seconds
      intervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 10000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isLoggedIn]);

  // Refresh when popover opens
  useEffect(() => {
    if (open && isLoggedIn) {
      fetchNotifications();
    }
  }, [open, isLoggedIn]);

  if (!isLoggedIn) return null;

  // Filter out viewed requests
  const unreadRequests = requests.filter(req => !viewedRequests.has(req.id));
  const unreadCount = unreadRequests.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-950"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-zinc-900 border-zinc-800 p-0 z-[100]"
        align="end"
        sideOffset={5}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Join Requests</h3>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-zinc-400 text-sm">Loading...</div>
          ) : requests.length > 0 ? (
            <div className="divide-y divide-zinc-800">
              {requests.map((request) => {
                const isViewed = viewedRequests.has(request.id);
                return (
                  <Link
                    key={request.id}
                    to={`/groups/${request.group_id}`}
                    onClick={() => {
                      // Mark as viewed
                      setViewedRequests(prev => new Set(prev).add(request.id));
                      setOpen(false);
                    }}
                    className={`block p-4 hover:bg-zinc-800 transition-colors ${isViewed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {request.user_email}
                        </p>
                        <p className="text-zinc-400 text-xs mt-1">
                          wants to join <span className="text-red-400 font-medium">{request.group_name}</span>
                        </p>
                        <p className="text-zinc-500 text-xs mt-1">
                          {new Date(request.requested_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No pending requests</p>
            </div>
          )}
        </div>

        {requests.length > 0 && (
          <div className="p-3 border-t border-zinc-800">
            <Link to="/groups" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                View All Groups
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

