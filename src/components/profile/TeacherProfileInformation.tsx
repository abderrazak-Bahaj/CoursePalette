import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/api/userService';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  year: z.coerce.number().min(1900, "Year must be valid").max(new Date().getFullYear(), "Year cannot be in the future"),
});

const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  year: z.coerce.number().min(1900, "Year must be valid").max(new Date().getFullYear(), "Year cannot be in the future"),
});

const teacherFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  teacher: z.object({
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    expertise: z.string().optional(),
    years_of_experience: z.coerce.number().min(0).optional(),
    education: z.array(educationSchema).default([]),
    certifications: z.array(certificationSchema).default([]),
  }),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

const TeacherProfileInformation = () => {
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
      teacher: {
        specialization: user?.teacher?.specialization || '',
        qualification: user?.teacher?.qualification || '',
        expertise: user?.teacher?.expertise || '',
        years_of_experience: user?.teacher?.years_of_experience || 0,
        education: user?.teacher?.education || [],
        certifications: user?.teacher?.certifications || [],
      },
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({
    control: form.control,
    name: "teacher.education",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({
    control: form.control,
    name: "teacher.certifications",
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: TeacherFormValues) => userService.updateProfile(data),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      refreshUserData();
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: TeacherFormValues) => {
    updateProfile(data);
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // If canceling edit mode, reset form to original values
      form.reset({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        bio: user?.bio || '',
        teacher: {
          specialization: user?.teacher?.specialization || '',
          qualification: user?.teacher?.qualification || '',
          expertise: user?.teacher?.expertise || '',
          years_of_experience: user?.teacher?.years_of_experience || 0,
          education: user?.teacher?.education || [],
          certifications: user?.teacher?.certifications || [],
        },
      });
    }
    setIsEditMode(!isEditMode);
  };

  // View mode data display component
  const ViewModeField = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{label}</h4>
      <p className="text-base">{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{isEditMode ? 'Edit Mode' : 'View Mode'}</span>
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
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {isEditMode ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label htmlFor="email">Email (Cannot be changed)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-2"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <p className="text-sm text-gray-500 mt-1">
                    Tell us a little about yourself.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />
            <h3 className="text-lg font-medium">Professional Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="teacher.specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacher.qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="teacher.expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expertise</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Machine Learning, Web Development, Data Science" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher.years_of_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />
            
            {/* Education Section */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  {educationFields.length > 0 ? (
                    <div className="space-y-4">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md relative">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2" 
                            onClick={() => removeEducation(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`teacher.education.${index}.degree`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g. Ph.D, M.S., B.S." />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`teacher.education.${index}.institution`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Institution</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g. MIT, Stanford" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`teacher.education.${index}.year`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No education records added yet.</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => appendEducation({ degree: '', institution: '', year: new Date().getFullYear() })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Certifications Section */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {certificationFields.length > 0 ? (
                    <div className="space-y-4">
                      {certificationFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md relative">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2" 
                            onClick={() => removeCertification(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`teacher.certifications.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Certification Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g. AWS Certified Developer" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`teacher.certifications.${index}.year`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No certifications added yet.</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => appendCertification({ name: '', year: new Date().getFullYear() })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        /* View mode */
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewModeField label="Full Name" value={user?.name} />
                <ViewModeField label="Email" value={user?.email} />
                <ViewModeField label="Phone" value={user?.phone} />
                <ViewModeField label="Address" value={user?.address} />
              </div>
              
              <Separator className="my-4" />
              
              <ViewModeField label="Bio" value={user?.bio} />
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium mb-4">Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewModeField label="Specialization" value={user?.teacher?.specialization} />
                <ViewModeField label="Qualification" value={user?.teacher?.qualification} />
                <ViewModeField label="Expertise" value={user?.teacher?.expertise} />
                <ViewModeField label="Years of Experience" value={user?.teacher?.years_of_experience?.toString()} />
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium mb-4">Education</h3>
              
              {user?.teacher?.education && user.teacher.education.length > 0 ? (
                <div className="space-y-4">
                  {user.teacher.education.map((edu, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ViewModeField label="Degree" value={edu.degree} />
                        <ViewModeField label="Institution" value={edu.institution} />
                        <ViewModeField label="Year" value={edu.year.toString()} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No education records available.</p>
              )}
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium mb-4">Certifications</h3>
              
              {user?.teacher?.certifications && user.teacher.certifications.length > 0 ? (
                <div className="space-y-4">
                  {user.teacher.certifications.map((cert, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ViewModeField label="Certification" value={cert.name} />
                        <ViewModeField label="Year" value={cert.year.toString()} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No certifications available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherProfileInformation;
