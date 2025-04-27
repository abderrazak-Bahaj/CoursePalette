import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface UserStatusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  onStatusUpdate: (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => void;
  isLoading: boolean;
}

export function UserStatusModal({
  isOpen,
  onOpenChange,
  userName,
  currentStatus,
  onStatusUpdate,
  isLoading,
}: UserStatusModalProps) {
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>(currentStatus);

  const handleSubmit = () => {
    onStatusUpdate(status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Status</DialogTitle>
          <DialogDescription>
            Change the status for {userName}. This will affect the user's ability to access the system.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={status}
            onValueChange={(value) => setStatus(value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="ACTIVE" id="active" />
              <div className="grid gap-1.5">
                <Label htmlFor="active" className="font-medium">Active</Label>
                <p className="text-sm text-muted-foreground">
                  User can access all features of the platform
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="INACTIVE" id="inactive" />
              <div className="grid gap-1.5">
                <Label htmlFor="inactive" className="font-medium">Inactive</Label>
                <p className="text-sm text-muted-foreground">
                  User account is created but not active yet
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="SUSPENDED" id="suspended" />
              <div className="grid gap-1.5">
                <Label htmlFor="suspended" className="font-medium">Suspended</Label>
                <p className="text-sm text-muted-foreground">
                  User account is temporarily suspended
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 