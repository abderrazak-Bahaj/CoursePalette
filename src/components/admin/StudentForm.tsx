
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { userService, UserData } from "@/services/api/userService";
import { useMutation } from "@tanstack/react-query";
import { UserRole } from "@/services/api/roleService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const studentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "teacher", "student"]),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  profileUrl: z.string().url({ message: "Please enter a valid URL" }).optional(),
  isActive: z.boolean().default(true),
});

interface StudentFormProps {
  onCancel: () => void;
  editStudent?: any;
  viewOnly?: boolean;
}

const StudentForm = ({ onCancel, editStudent, viewOnly = false }: StudentFormProps) => {
  const { toast } = useToast();
  const [avatar, setAvatar] = useState<File | null>(null);

  // Initialize the form with default values or values from editStudent if provided
  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: editStudent ? {
      name: editStudent.name,
      email: editStudent.email,
      role: editStudent.role || "student",
      profileUrl: editStudent.profileUrl,
      isActive: editStudent.status !== "inactive",
    } : {
      name: "",
      email: "",
      role: "student",
      isActive: true,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: UserData) => userService.createUser(data),
    onSuccess: () => {
      toast({
        title: "Student Created",
        description: "The student has been created successfully.",
      });
      onCancel();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create student. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create student:", error);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserData> }) => 
      userService.updateUser(id, data),
    onSuccess: () => {
      toast({
        title: "Student Updated",
        description: "The student has been updated successfully.",
      });
      onCancel();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update student:", error);
    }
  });

  const onSubmit = async (formData: z.infer<typeof studentFormSchema>) => {
    const userData: UserData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      password: formData.password,
      profileUrl: formData.profileUrl,
    };

    if (editStudent) {
      updateUserMutation.mutate({
        id: editStudent.id,
        data: userData
      });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={form.watch("profileUrl") || (editStudent?.avatar || "")} />
                  <AvatarFallback className="text-xl">
                    {form.watch("name")?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {!viewOnly && (
                  <div className="absolute bottom-0 right-0">
                    <Input
                      id="avatar"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatar(file);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              form.setValue("profileUrl", URL.createObjectURL(file));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => document.getElementById("avatar")?.click()}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} readOnly={viewOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} readOnly={viewOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      disabled={viewOnly}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                        <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                        <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!editStudent && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} readOnly={viewOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="profileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.jpg" {...field} readOnly={viewOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={viewOnly}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">Active account</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!viewOnly && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {(createUserMutation.isPending || updateUserMutation.isPending) 
                    ? "Saving..." 
                    : editStudent 
                      ? "Update Student" 
                      : "Create Student"
                  }
                </Button>
              </div>
            )}
            
            {viewOnly && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" onClick={onCancel}>
                  Close
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StudentForm;
