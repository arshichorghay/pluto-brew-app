
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Label } from './ui/label';
import { Input } from './ui/input';

const AddressIcon = ({ alias }: { alias: string }) => {
    if (alias.toLowerCase().includes('home')) return <Home className="h-5 w-5" />;
    if (alias.toLowerCase().includes('work')) return <Briefcase className="h-5 w-5" />;
    return <MapPin className="h-5 w-5" />
}

export function ManageAddressesCard() {
    const { user, refreshUser } = useAuth();
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
            await refreshUser();
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
        
        if (addressToEdit) { 
            updatedAddresses = user.savedAddresses?.map(a => 
                a.id === addressToEdit.id ? { ...formData, id: a.id } : a
            ) || [];
        } else {
            const newAddress: SavedAddress = { ...formData, id: `addr_${Date.now()}`};
            updatedAddresses = [...(user.savedAddresses || []), newAddress];
        }

        try {
            await updateUser(user.id, { savedAddresses: updatedAddresses });
            await refreshUser();
            toast({ title: "Address Saved", description: "Your address list has been updated." });
            setIsFormOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save address." });
        }
    };
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) return null;

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
                <DialogContent 
                    className="max-w-2xl"
                    onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('.pac-container')) {
                            e.preventDefault();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{addressToEdit ? 'Edit' : 'Add'} Address</DialogTitle>
                    </DialogHeader>
                    <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
                        <AddressForm 
                            onSave={handleFormSave} 
                            onCancel={() => setIsFormOpen(false)}
                            initialData={addressToEdit}
                            isOpen={isFormOpen}
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
    isOpen: boolean;
}

function AddressForm({ onSave, onCancel, initialData, isOpen }: AddressFormProps) {
    const [alias, setAlias] = useState(initialData?.alias || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initialData ? {lat: initialData.lat, lng: initialData.lng} : null);
    const [mapCenter, setMapCenter] = useState(initialData ? { lat: initialData.lat, lng: initialData.lng } : { lat: 49.0069, lng: 8.4037 });
    const [latInput, setLatInput] = useState(initialData?.lat.toString() || '');
    const [lngInput, setLngInput] = useState(initialData?.lng.toString() || '');

    const placesLib = useMapsLibrary('places');
    const geocodingLib = useMapsLibrary('geocoding');
    const addressInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const updateLocationState = useCallback((lat: number, lng: number, addr: string) => {
        setPin({ lat, lng });
        setAddress(addr);
        setMapCenter({ lat, lng });
        setLatInput(lat.toString());
        setLngInput(lng.toString());
        if (addressInputRef.current) {
            addressInputRef.current.value = addr;
        }
    }, []);
    
    useEffect(() => {
        if (!placesLib || !addressInputRef.current) return;

        const autocomplete = new placesLib.Autocomplete(addressInputRef.current, {
            fields: ["geometry", "name", "formatted_address"],
        });

        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place?.geometry?.location) {
                const newLat = place.geometry.location.lat();
                const newLng = place.geometry.location.lng();
                const formattedAddress = place.formatted_address || place.name || '';
                updateLocationState(newLat, newLng, formattedAddress);
                toast({ title: 'Location Found', description: `Pin set for ${formattedAddress}` });
            }
        });

        return () => {
            if (typeof google !== 'undefined') {
                if (listener) {
                    google.maps.event.removeListener(listener);
                }
                if (addressInputRef.current) {
                    google.maps.event.clearInstanceListeners(addressInputRef.current);
                }
            }
            const pacContainers = document.querySelectorAll('.pac-container');
            pacContainers.forEach(container => container.remove());
        };
    }, [placesLib, toast, updateLocationState, isOpen]);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (!geocodingLib || !e.latLng) return;

        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();

        const geocoder = new geocodingLib.Geocoder();
        geocoder.geocode({ location: e.latLng }, (results, status) => {
            let newAddress = '';
            if (status === 'OK' && results?.[0]) {
                newAddress = results[0].formatted_address;
                toast({ title: "Location Set", description: "Address updated." });
            } else {
                newAddress = `Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}`;
                toast({ title: "Location Set", variant: "destructive", description: "Could not find address. Using coordinates." });
            }
            updateLocationState(newLat, newLng, newAddress);
        });
    }, [geocodingLib, toast, updateLocationState]);
    
    const handleCoordinateSet = useCallback(() => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          toast({ variant: 'destructive', title: 'Invalid Coordinates', description: 'Please enter valid latitude and longitude.' });
          return;
        }
        
        if (!geocodingLib) return;
        const geocoder = new geocodingLib.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            let newAddress = '';
            if (status === 'OK' && results?.[0]) {
                newAddress = results[0].formatted_address;
                toast({ title: "Location Set", description: `Address found for coordinates.` });
            } else {
                newAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                toast({ title: "Location Set", description: 'Using coordinates as address.' });
            }
            updateLocationState(lat, lng, newAddress);
        });
      }, [latInput, lngInput, geocodingLib, toast, updateLocationState]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (alias && address && pin) {
            onSave({ alias, address, lat: pin.lat, lng: pin.lng });
        } else {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide an alias and select an address on the map.' });
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="alias">Address Name / Alias</Label>
                    <Input id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="e.g., Home, Work" />
                </div>
                <div className="grid gap-4">
                    <div className="h-[250px] w-full rounded-md overflow-hidden border">
                        <Map
                            center={mapCenter}
                            zoom={13}
                            mapId="address_form_map"
                            gestureHandling={'greedy'}
                            onClick={handleMapClick}
                            clickableIcons={false}
                        >
                            {pin && <AdvancedMarker position={pin} title={"Selected Location"} />}
                        </Map>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address-search-dialog">Search for delivery address</Label>
                        <Input 
                            id="address-search-dialog" 
                            ref={addressInputRef}
                            placeholder="Start typing your delivery address..."
                            defaultValue={initialData?.address}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="lat-input">Latitude</Label>
                            <Input 
                                id="lat-input" 
                                placeholder="e.g., 49.0093"
                                value={latInput}
                                onChange={(e) => setLatInput(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lng-input">Longitude</Label>
                            <Input 
                                id="lng-input" 
                                placeholder="e.g., 8.4044"
                                value={lngInput}
                                onChange={(e) => setLngInput(e.target.value)}
                            />
                        </div>
                        <Button type="button" onClick={handleCoordinateSet} className="w-full">Set from Coords</Button>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={!alias || !address || !pin}>Save Address</Button>
            </DialogFooter>
        </form>
    );
}
