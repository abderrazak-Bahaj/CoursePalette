import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { userService } from '@/services/api/userService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface InstructorFormData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  phone?: string;
  address?: string;
}

interface InstructorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InstructorModal = ({
  isOpen,
  onOpenChange,
}: InstructorModalProps) => {
  const [formData, setFormData] = useState<InstructorFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const [isCopied, setIsCopied] = useState({
    email: false,
    password: false,
    both: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTeacherMutation = useMutation({
    mutationFn: (data: InstructorFormData) =>
      userService.createUserByAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'TEACHER',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: 'Teacher created',
        description: 'New instructor has been added successfully',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create instructor. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      bio: '',
      phone: '',
      address: '',
    });
    setIsCopied({
      email: false,
      password: false,
      both: false,
    });
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setFormData({
      ...formData,
      password,
    });
    // Reset copy states
    setIsCopied({
      email: false,
      password: false,
      both: false,
    });
  };

  const copyToClipboard = (
    text: string,
    type: 'email' | 'password' | 'both'
  ) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied((prev) => ({ ...prev, [type]: true }));

      // Reset copied state after 3 seconds
      setTimeout(() => {
        setIsCopied((prev) => ({ ...prev, [type]: false }));
      }, 3000);
    });
  };

  const handleSubmit = () => {
    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast({
        title: 'Validation Error',
        description: 'Name, email and password are required',
        variant: 'destructive',
      });
      return;
    }

    createTeacherMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Instructor</DialogTitle>
          <DialogDescription>
            Create a new instructor account. A secure password will be
            generated.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="pr-10"
                placeholder="instructor@example.com"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => copyToClipboard(formData.email, 'email')}
              >
                {isCopied.email ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative flex items-center gap-2">
              <Input
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="pr-10"
                placeholder="Secure password"
                type="text"
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={generateRandomPassword}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890 (optional)"
            />
          </div>
          <div>
            <div className="bg-muted p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Credentials</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `Email: ${formData.email}\nPassword: ${formData.password}`,
                      'both'
                    )
                  }
                  className="h-8"
                >
                  {isCopied.both ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy All
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Make sure to save these credentials or share them with the
                instructor.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createTeacherMutation.isPending}
          >
            {createTeacherMutation.isPending
              ? 'Creating...'
              : 'Create Instructor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstructorModal;
