
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateProduct, uploadProductImage } from '@/lib/storage';
import type { Product, UpdateProduct } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive integer.'),
  category: z.string().min(1, 'Category is required.'),
  newImage: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface EditProductFormProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: () => void;
}

export function EditProductForm({ product, isOpen, onOpenChange, onProductUpdate }: EditProductFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      newImage: null,
    },
  });

  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        newImage: null,
      });
    }
  }, [product, form, isOpen]); // Reset form when dialog opens or product changes

  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;
    setIsSaving(true);
    console.log("Starting product update process...");

    try {
        const productUpdateData: UpdateProduct = {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            category: data.category,
            imageUrl: product.imageUrl, // Start with the existing URL
        };

        const newImageFile = data.newImage;

        if (newImageFile instanceof File) {
            console.log("New image file detected. Validating...");
            if (newImageFile.size > MAX_FILE_SIZE) {
                throw new Error('Max file size is 5MB.');
            }
            if (!ACCEPTED_IMAGE_TYPES.includes(newImageFile.type)) {
                throw new Error('Only .jpg, .jpeg, .png and .webp formats are supported.');
            }
            console.log("Validation passed. Starting upload...");
            try {
                const newImageUrl = await uploadProductImage(newImageFile);
                console.log("Image uploaded successfully. URL:", newImageUrl);
                productUpdateData.imageUrl = newImageUrl;
            } catch (uploadError) {
                console.error("!!! FAILED AT IMAGE UPLOAD !!!", uploadError);
                toast({ variant: 'destructive', title: 'Image Upload Failed', description: 'Could not upload the new image. Check console for details.' });
                return; // Stop execution
            }
        } else {
            console.log("No new image file detected. Skipping upload.");
        }

        console.log("Updating product document in Firestore with data:", productUpdateData);
        await updateProduct(product.id, productUpdateData);
        console.log("Product document updated successfully.");

        toast({
            title: 'Product Updated',
            description: `"${data.name}" has been successfully updated.`,
        });
        onProductUpdate();
        onOpenChange(false);

    } catch (error) {
        console.error("!!! ERROR IN ONSUBMIT PROCESS !!!", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            variant: 'destructive',
            title: 'Error updating product',
            description: errorMessage,
        });
    } finally {
        console.log("Finishing update process, resetting button state.");
        setIsSaving(false);
    }
  };
  
  const fileRef = form.register('newImage');
  const imageField = form.watch('newImage');
  const previewUrl = imageField instanceof File ? URL.createObjectURL(imageField) : (product?.imageUrl || 'https://placehold.co/100x100.png');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to the product details. Click save when done.
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
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-2">
                <FormLabel>Product Image</FormLabel>
                <div className="mt-2">
                    <Image 
                        src={previewUrl}
                        alt={product?.name || 'Product Image'}
                        width={100}
                        height={100}
                        className="rounded-md object-cover border"
                        unoptimized // This helps avoid issues with temporary blob URLs for previews
                    />
                </div>
            </div>

            <FormItem>
                <FormLabel>Upload New Image</FormLabel>
                <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      {...fileRef}
                    />
                </FormControl>
                <FormDescription>
                    Leave blank to keep the current image. Max 5MB.
                </FormDescription>
                <FormMessage />
            </FormItem>

            <DialogFooter>
               <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
