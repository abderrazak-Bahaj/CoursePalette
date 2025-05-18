import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Upload,
  Calendar,
  GraduationCap,
  Pencil,
  Eye,
  Loader2,
  User,
  MapPin,
  Phone,
  AtSign,
  X,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SecuritySettings from '@/components/profile/SecuritySettings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/api/userService';
import AvatarProfile from '@/components/profile/AvatarProfile';
import StudentInvoicesPage from './invoices/StudentInvoicesPage';

type StudentData = {
  student_id?: string;
  enrollment_status?: string;
  education_level?: string;
  major?: string;
  interests?: string[];
  date_of_birth?: string;
  learning_preferences?: string[];
  gpa?: string;
};

interface UserWithStudent {
  id?: string;
  name?: string;
  email?: string;
  bio?: string;
  role?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  status?: string;
  student?: StudentData;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  student: z
    .object({
      student_id: z.string().optional(),
      enrollment_status: z.string().optional(),
      education_level: z.string().optional(),
      major: z.string().optional(),
      date_of_birth: z.string().optional(),
      interests: z.array(z.string()).optional(),
      learning_preferences: z.array(z.string()).optional(),
    })
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

// Custom form field with icon component
const IconFormField = ({
  name,
  label,
  icon: Icon,
  type = 'text',
  isTextarea = false,
  hint,
  readOnly = false,
  control,
  ...props
}: {
  name: any;
  label: string;
  icon: React.ComponentType<any>;
  type?: string;
  isTextarea?: boolean;
  hint?: string;
  readOnly?: boolean;
  control: any;
}) => (
  <FormField
    {...props}
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-gray-500" />
          <FormLabel className="mb-0">{label}</FormLabel>
        </div>
        <FormControl>
          <div className="pl-6">
            {isTextarea ? (
              <Textarea {...field} rows={4} readOnly={readOnly} />
            ) : (
              <Input {...field} type={type} readOnly={readOnly} />
            )}
          </div>
        </FormControl>
        {hint && <p className="text-sm text-gray-500 mt-1 pl-6">{hint}</p>}
        <FormMessage className="pl-6" />
      </FormItem>
    )}
  />
);

// Enhanced View mode field component with icons
const ViewModeField = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | number | null;
  icon: React.ComponentType<any>;
}) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-4 w-4 text-gray-500" />
      <h4 className="text-sm font-medium text-gray-500">{label}</h4>
    </div>
    <p className="text-base pl-6">{value || '-'}</p>
  </div>
);

const ProfilePage = () => {
  const { user, refreshUserData } = useAuth();
  const typedUser = user as UserWithStudent;
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);


  const [interests, setInterests] = useState<string[]>(
    (typedUser?.student?.interests) || []
  );
  const [interestInput, setInterestInput] = useState('');
  const [learningPreferences, setLearningPreferences] = useState<string[]>(
    typedUser?.student?.learning_preferences || []
  );
  const [preferenceInput, setPreferenceInput] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: typedUser?.name || '',
      email: typedUser?.email || '',
      phone: typedUser?.phone || '',
      address: typedUser?.address || '',
      bio: typedUser?.bio || '',
      student: {
        student_id: typedUser?.student?.student_id || '',
        enrollment_status: typedUser?.student?.enrollment_status || 'ACTIVE',
        education_level: typedUser?.student?.education_level || '',
        major: typedUser?.student?.major || '',
        date_of_birth: typedUser?.student?.date_of_birth
          ? new Date(typedUser.student.date_of_birth)
              .toISOString()
              .split('T')[0]
          : '',
      },
    },
  });

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const addPreference = () => {
    if (
      preferenceInput.trim() &&
      !learningPreferences.includes(preferenceInput.trim())
    ) {
      setLearningPreferences([...learningPreferences, preferenceInput.trim()]);
      setPreferenceInput('');
    }
  };

  const removePreference = (preference: string) => {
    setLearningPreferences(learningPreferences.filter((p) => p !== preference));
  };

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: FormData) => {
      // Prepare data with the interests and preferences arrays
      const formData = {
        ...data,
        student: {
          ...data.student,
          interests,
          learning_preferences: learningPreferences,
        },
      };

      return userService.updateProfile(formData);
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
      refreshUserData();
      // Switch back to view mode after successful update
      setIsEditMode(false);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your profile',
        variant: 'destructive',
      });
    },
  });

  const toggleEditMode = () => {
    if (isEditMode) {
      // If canceling edit mode, reset form to original values
      form.reset({
        name: typedUser?.name || '',
        email: typedUser?.email || '',
        phone: typedUser?.phone || '',
        address: typedUser?.address || '',
        bio: typedUser?.bio || '',
        student: {
          student_id: typedUser?.student?.student_id || '',
          enrollment_status: typedUser?.student?.enrollment_status || 'ACTIVE',
          education_level: typedUser?.student?.education_level || '',
          major: typedUser?.student?.major || '',
          date_of_birth: typedUser?.student?.date_of_birth
            ? new Date(typedUser.student.date_of_birth)
                .toISOString()
                .split('T')[0]
            : '',
        },
      });

      // Reset arrays to original values
      setInterests(typedUser?.student?.interests || []);
      setLearningPreferences(typedUser?.student?.learning_preferences || []);
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            {/*             <TabsTrigger value="preferences">Preferences</TabsTrigger>
             */}{' '}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <AvatarProfile />

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {isEditMode ? 'Edit Mode' : 'View Mode'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleEditMode}
                    disabled={isUpdating}
                  >
                    {isEditMode ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isEditMode ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => updateProfile(data))}
                    className="space-y-6"
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <IconFormField
                                name="name"
                                label="Full Name"
                                icon={User}
                                control={form.control}
                              />
                              <IconFormField
                                name="email"
                                label="Email"
                                icon={AtSign}
                                type="email"
                                control={form.control}
                              />
                              <IconFormField
                                name="phone"
                                label="Phone Number"
                                icon={Phone}
                                control={form.control}
                              />
                              <IconFormField
                                name="address"
                                label="Address"
                                icon={MapPin}
                                control={form.control}
                              />
                            </div>

                            <div className="mt-4">
                              <IconFormField
                                name="bio"
                                label="Bio"
                                icon={FileText}
                                isTextarea={true}
                                control={form.control}
                                hint="Share a brief description about yourself, your learning goals, and interests."
                              />
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Academic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <IconFormField
                                name="student.student_id"
                                label="Student ID"
                                icon={User}
                                readOnly={true}
                                disabled={true}
                                control={form.control}
                                hint="Student ID cannot be changed"
                              />
                              <IconFormField
                                name="student.enrollment_status"
                                label="Enrollment Status"
                                icon={User}
                                disabled={true}
                                readOnly={true}
                                control={form.control}
                                hint="Contact administration to change status"
                              />
                              <IconFormField
                                name="student.education_level"
                                label="Education Level"
                                icon={GraduationCap}
                                control={form.control}
                              />
                              <IconFormField
                                name="student.major"
                                label="Major"
                                icon={GraduationCap}
                                control={form.control}
                              />
                              <IconFormField
                                name="student.date_of_birth"
                                label="Date of Birth"
                                icon={Calendar}
                                type="date"
                                control={form.control}
                              />
                            </div>

                            <div className="mt-4">
                              <Label className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                Interests
                              </Label>
                              <div className="flex flex-wrap gap-2 mb-2 pl-6">
                                {interests.map((interest, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="gap-1"
                                  >
                                    {interest}
                                    <button
                                      type="button"
                                      className="ml-1 text-gray-500 hover:text-gray-700"
                                      onClick={() => removeInterest(interest)}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex space-x-2 pl-6">
                                <Input
                                  placeholder="Add an interest"
                                  value={interestInput}
                                  onChange={(e) =>
                                    setInterestInput(e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    (e.preventDefault(), addInterest())
                                  }
                                />
                                <Button
                                  type="button"
                                  onClick={addInterest}
                                  size="sm"
                                >
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4">
                              <Label className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-gray-500" />
                                Learning Preferences
                              </Label>
                              <div className="flex flex-wrap gap-2 mb-2 pl-6">
                                {learningPreferences.map(
                                  (preference, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="gap-1"
                                    >
                                      {preference}
                                      <button
                                        type="button"
                                        className="ml-1 text-gray-500 hover:text-gray-700"
                                        onClick={() =>
                                          removePreference(preference)
                                        }
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  )
                                )}
                              </div>
                              <div className="flex space-x-2 pl-6">
                                <Input
                                  placeholder="Add a learning preference"
                                  value={preferenceInput}
                                  onChange={(e) =>
                                    setPreferenceInput(e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    (e.preventDefault(), addPreference())
                                  }
                                />
                                <Button
                                  type="button"
                                  onClick={addPreference}
                                  size="sm"
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ViewModeField
                            label="Full Name"
                            value={typedUser?.name}
                            icon={User}
                          />
                          <ViewModeField
                            label="Email"
                            value={typedUser?.email}
                            icon={AtSign}
                          />
                          <ViewModeField
                            label="Phone"
                            value={typedUser?.phone}
                            icon={Phone}
                          />
                          <ViewModeField
                            label="Address"
                            value={typedUser?.address}
                            icon={MapPin}
                          />
                        </div>

                        <ViewModeField
                          label="Bio"
                          value={typedUser?.bio}
                          icon={FileText}
                        />
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Academic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ViewModeField
                            label="Student ID"
                            value={typedUser?.student?.student_id}
                            icon={User}
                          />
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-gray-500" />
                              <h4 className="text-sm font-medium text-gray-500">
                                Enrollment Status
                              </h4>
                            </div>
                            <div className="pl-6">
                              <Badge
                                variant={
                                  typedUser?.student?.enrollment_status ===
                                  'ACTIVE'
                                    ? 'success'
                                    : 'secondary'
                                }
                              >
                                {typedUser?.student?.enrollment_status ||
                                  'Not available'}
                              </Badge>
                            </div>
                          </div>
                          <ViewModeField
                            label="Education Level"
                            value={typedUser?.student?.education_level}
                            icon={GraduationCap}
                          />
                          <ViewModeField
                            label="Major"
                            value={typedUser?.student?.major}
                            icon={GraduationCap}
                          />
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <h4 className="text-sm font-medium text-gray-500">
                                Date of Birth
                              </h4>
                            </div>
                            <p className="text-base pl-6">
                              {typedUser?.student?.date_of_birth
                                ? new Date(
                                    typedUser.student.date_of_birth
                                  ).toLocaleDateString()
                                : '-'}
                            </p>
                          </div>
                          <ViewModeField
                            label="GPA"
                            value={typedUser?.student?.gpa}
                            icon={GraduationCap}
                          />

                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-gray-500" />
                              <h4 className="text-sm font-medium text-gray-500">
                                Interests
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-6">
                              {console.log("typedUser",typedUser?.student?.interests)}
                              
                              {typedUser?.student?.interests?.length > 0 ? (
                                typedUser?.student?.interests?.map(
                                  (interest, index) => (
                                    <Badge key={index} variant="outline">
                                      {interest}
                                    </Badge>
                                  )
                                )
                              ) : (
                                <span className="text-gray-500">
                                  No interests specified
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap className="h-4 w-4 text-gray-500" />
                              <h4 className="text-sm font-medium text-gray-500">
                                Learning Preferences
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-6">
                              {typedUser?.student?.learning_preferences &&
                              typedUser.student.learning_preferences.length >
                                0 ? (
                                typedUser.student.learning_preferences.map(
                                  (preference, index) => (
                                    <Badge key={index} variant="outline">
                                      {preference}
                                    </Badge>
                                  )
                                )
                              ) : (
                                <span className="text-gray-500">
                                  No learning preferences specified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="invoices">
            <StudentInvoicesPage />
          </TabsContent>

          {/*  <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications about course updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Course Recommendations</h3>
                      <p className="text-sm text-gray-500">Receive personalized course recommendations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Learning Reminders</h3>
                      <p className="text-sm text-gray-500">Receive reminders to continue your learning</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">New Features</h3>
                      <p className="text-sm text-gray-500">Be notified about new platform features</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="pt-4">
                    <Button>Save Preferences</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
