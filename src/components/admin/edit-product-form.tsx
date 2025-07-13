
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
import { updateProduct } from '@/lib/storage';
import type { Product, UpdateProduct } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive integer.'),
  category: z.string().min(1, 'Category is required.'),
  imageUrl: z.string().optional(),
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
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      imageUrl: '',
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
        imageUrl: product.imageUrl,
        newImage: undefined,
      });
      setPreviewImage(product.imageUrl || null);
    }
  }, [product, form, isOpen]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(product?.imageUrl || null);
    }
    form.setValue('newImage', event.target.files);
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;
    setIsSaving(true);
    
    let uploadedImageUrl = product.imageUrl;

    try {
      const file = data.newImage?.[0];
      if (file) {
        console.log("New file selected. Uploading...");
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'File upload failed.');
        }

        console.log("File uploaded successfully:", result.url);
        uploadedImageUrl = result.url;
      }

      const productUpdateData: UpdateProduct = {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          category: data.category,
          imageUrl: uploadedImageUrl,
      };

      console.log("Updating product document in Firestore...");
      await updateProduct(product.id, productUpdateData);
      console.log("Product document updated.");

      toast({
          title: 'Product Updated',
          description: `"${data.name}" has been successfully updated.`,
      });
      onProductUpdate();
      onOpenChange(false);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("Error during product update:", errorMessage);
        toast({
            variant: 'destructive',
            title: 'Error updating product',
            description: errorMessage,
        });
    } finally {
      setIsSaving(false);
    }
  };
  
  const displayUrl = previewImage || 'https://placehold.co/100x100.png';


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

            <div className="grid grid-cols-2 gap-4 items-center">
              <FormField
                control={form.control}
                name="newImage"
                render={() => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                       <Input type="file" accept="image/*" onChange={handleFileChange} />
                    </FormControl>
                    <FormDescription>
                      Upload a new image to replace the current one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                  <FormLabel>Image Preview</FormLabel>
                  <div className="mt-2">
                      <Image 
                          src={displayUrl}
                          alt={product?.name || 'Product Image'}
                          width={100}
                          height={100}
                          className="rounded-md object-cover border"
                          unoptimized
                      />
                  </div>
              </div>
            </div>

            <DialogFooter>
               <Button type="submit" disabled={isSaving}>
                 {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {isSaving ? 'Saving...' : 'Save changes'}
               </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
