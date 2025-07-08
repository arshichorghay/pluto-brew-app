
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/auth-context';
import { updateUser } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { type SavedAddress } from '@/lib/types';
import { Home, Briefcase, PlusCircle, MapPin, Trash2, Edit } from 'lucide-react';
import { AddressPicker } from './address-picker';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Label } from './ui/label';
import { Input } from './ui/input';

const AddressIcon = ({ alias }: { alias: string }) => {
    if (alias.toLowerCase().includes('home')) return <Home className="h-5 w-5" />;
    if (alias.toLowerCase().includes('work')) return <Briefcase className="h-5 w-5" />;
    return <MapPin className="h-5 w-5" />
}

export function ManageAddressesCard() {
    const { user, login } = useAuth();
    const { toast } = useToast();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<SavedAddress | null>(null);
    const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(null);

    const handleEdit = (address: SavedAddress) => {
        setAddressToEdit(address);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setAddressToEdit(null);
        setIsFormOpen(true);
    };

    const handleDeleteRequest = (address: SavedAddress) => {
        setAddressToDelete(address);
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!user || !addressToDelete) return;

        const updatedAddresses = user.savedAddresses?.filter(a => a.id !== addressToDelete.id) || [];
        
        try {
            await updateUser(user.id, { savedAddresses: updatedAddresses });
            // This is a way to refresh the user state in the context
            await login(user.email, user.password);
            toast({ title: "Address Deleted", description: `The address "${addressToDelete.alias}" was removed.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete address." });
        } finally {
            setIsDeleteConfirmOpen(false);
            setAddressToDelete(null);
        }
    };
    
    const handleFormSave = async (formData: Omit<SavedAddress, 'id'>) => {
        if (!user) return;

        let updatedAddresses: SavedAddress[];
        
        if (addressToEdit) { // Editing existing address
            updatedAddresses = user.savedAddresses?.map(a => 
                a.id === addressToEdit.id ? { ...formData, id: a.id } : a
            ) || [];
        } else { // Adding new address
            const newAddress: SavedAddress = { ...formData, id: `addr_${Date.now()}`};
            updatedAddresses = [...(user.savedAddresses || []), newAddress];
        }

        try {
            await updateUser(user.id, { savedAddresses: updatedAddresses });
            // Re-login to refresh user data in context
            await login(user.email, user.password);
            toast({ title: "Address Saved", description: "Your address list has been updated." });
            setIsFormOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save address." });
        }
    };
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) return null; // Or show an error

    return (
        <Card>
            <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your delivery addresses for faster checkout.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {user?.savedAddresses && user.savedAddresses.length > 0 ? (
                        user.savedAddresses.map(addr => (
                            <div key={addr.id} className="flex items-center p-3 -m-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <AddressIcon alias={addr.alias} />
                                <div className="ml-4 flex-1">
                                    <p className="font-semibold">{addr.alias}</p>
                                    <p className="text-sm text-muted-foreground">{addr.address}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="mr-1" onClick={() => handleEdit(addr)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(addr)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">You have no saved addresses.</p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" variant="outline" onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                </Button>
            </CardFooter>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{addressToEdit ? 'Edit' : 'Add'} Address</DialogTitle>
                    </DialogHeader>
                    <APIProvider apiKey={apiKey}>
                        <AddressForm 
                            onSave={handleFormSave} 
                            onCancel={() => setIsFormOpen(false)}
                            initialData={addressToEdit}
                        />
                    </APIProvider>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the address "{addressToDelete?.alias}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}


interface AddressFormProps {
    onSave: (data: Omit<SavedAddress, 'id'>) => void;
    onCancel: () => void;
    initialData?: SavedAddress | null;
}

function AddressForm({ onSave, onCancel, initialData }: AddressFormProps) {
    const [alias, setAlias] = useState(initialData?.alias || '');
    const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(initialData ? { address: initialData.address, lat: initialData.lat, lng: initialData.lng } : null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (alias && location) {
            onSave({ alias, ...location });
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="alias">Address Name / Alias</Label>
                    <Input id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="e.g., Home, Work" />
                </div>
                <div>
                    <Label>Location</Label>
                    <AddressPicker onLocationSelect={setLocation} initialLocation={initialData ? {address: initialData.address, lat: initialData.lat, lng: initialData.lng} : undefined} />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={!alias || !location}>Save Address</Button>
            </DialogFooter>
        </form>
    )
}
