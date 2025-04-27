import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clipboard, RefreshCw } from 'lucide-react';

interface UserPasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onPasswordUpdate: (password: string) => void;
  isLoading: boolean;
}

export function UserPasswordModal({
  isOpen,
  onOpenChange,
  userName,
  onPasswordUpdate,
  isLoading,
}: UserPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateRandomPassword();
    }
  }, [isOpen]);

  const generateRandomPassword = () => {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=';
    const newPassword = Array.from(
      { length: 12 },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join('');
    setPassword(newPassword);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const handleSubmit = () => {
    if (password.trim()) {
      onPasswordUpdate(password);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            Generate a new password for <span className="font-medium">{userName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateRandomPassword}
                title="Generate new password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {isCopied && (
              <p className="text-xs text-green-600">
                Password copied to clipboard!
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            This will reset the user's password. They will need to use this new password for their next login.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !password.trim()}>
            {isLoading ? "Updating..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 