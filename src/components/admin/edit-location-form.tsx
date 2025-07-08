
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateLocation } from '@/lib/storage';
import type { Location } from '@/lib/types';
import React from 'react';

const locationFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

interface EditLocationFormProps {
  location: Location | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationUpdate: () => void;
}

export function EditLocationForm({ location, isOpen, onOpenChange, onLocationUpdate }: EditLocationFormProps) {
  const { toast } = useToast();
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: location?.name || '',
      lat: location?.lat || 0,
      lng: location?.lng || 0,
    },
  });

  React.useEffect(() => {
    if (location) {
      form.reset(location);
    }
  }, [location, form]);

  const onSubmit = async (data: LocationFormValues) => {
    if (!location) return;

    try {
      await updateLocation(location.id, data);
      toast({
        title: 'Location Updated',
        description: `"${data.name}" has been successfully updated.`,
      });
      onLocationUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating location',
        description: 'There was a problem saving the location information.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>
            Make changes to the location details. Click save when done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="lat" render={({ field }) => (
                <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl><Input type="number" step="any" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField control={form.control} name="lng" render={({ field }) => (
                <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl><Input type="number" step="any" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
