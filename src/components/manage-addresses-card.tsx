
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
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
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
            // Re-login to refresh user data in context. A more robust solution might use a dedicated context updater.
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
            // Re-login to refresh user data
            await login(user.email, user.password);
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{addressToEdit ? 'Edit' : 'Add'} Address</DialogTitle>
                    </DialogHeader>
                    <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
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
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initialData ? {lat: initialData.lat, lng: initialData.lng} : null);
    const [address, setAddress] = useState<string>(initialData?.address || "");
    const [mapCenter, setMapCenter] = useState(initialData || { lat: 49.0069, lng: 8.4037 });
    
    const { toast } = useToast();
    const map = useMap();

    const updateLocationState = useCallback((newPin: { lat: number; lng: number }, newAddress: string) => {
        setPin(newPin);
        setMapCenter(newPin);
        setAddress(newAddress);
        if (map) map.panTo(newPin);
    }, [map]);

    const handleMapClick = (e: google.maps.MapMouseEvent, geocoder: google.maps.Geocoder) => {
        if (!e.latLng) return;
        const newPin = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        
        geocoder.geocode({ location: e.latLng }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
                updateLocationState(newPin, results[0].formatted_address);
                toast({ title: "Location Set", description: `Address updated.` });
            } else {
                const newAddressStr = `Lat: ${newPin.lat.toFixed(6)}, Lng: ${newPin.lng.toFixed(6)}`;
                updateLocationState(newPin, newAddressStr);
                toast({ title: "Location Set", variant: "destructive", description: "Could not find address. Using coordinates." });
            }
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (alias && address && pin) {
            onSave({ alias, address, lat: pin.lat, lng: pin.lng });
        } else {
          toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide an alias and select an address on the map.'})
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
                    <div className="grid gap-4 pt-2">
                        <div className="h-[250px] w-full rounded-md overflow-hidden border">
                            <Map
                                center={mapCenter}
                                zoom={13}
                                mapId="address_picker_map_dialog"
                                gestureHandling={'greedy'}
                                onClick={(e) => {
                                  // Geocoder is loaded here to ensure it's available for the click event
                                  const geocoder = new google.maps.Geocoder();
                                  handleMapClick(e, geocoder);
                                }}
                                clickableIcons={false}
                            >
                                {pin && <AdvancedMarker position={pin} title={"Selected Location"} />}
                            </Map>
                        </div>
                        <AddressSearchBox
                          initialValue={address}
                          onPlaceSelect={(place) => {
                            if (place.geometry?.location) {
                              const newPin = {
                                  lat: place.geometry.location.lat(),
                                  lng: place.geometry.location.lng(),
                              };
                              updateLocationState(newPin, place.formatted_address || '');
                            }
                          }}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={!alias || !address || !pin}>Save Address</Button>
            </DialogFooter>
        </form>
    )
}

function AddressSearchBox({ onPlaceSelect, initialValue }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void, initialValue?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;
    
    const autocomplete = new places.Autocomplete(inputRef.current);
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelect(place);
      }
    });

    return () => {
        if(listener) google.maps.event.removeListener(listener);
        if (inputRef.current) {
            google.maps.event.clearInstanceListeners(inputRef.current);
        }
        document.querySelectorAll('.pac-container').forEach(c => c.remove());
    }
  }, [places, onPlaceSelect]);
  
  // Set initial value if provided
  useEffect(() => {
    if (inputRef.current && initialValue) {
        inputRef.current.value = initialValue;
    }
  }, [initialValue])

  return (
    <div className="grid gap-2">
        <Label htmlFor="address-search-dialog">Search for delivery address</Label>
        <Input 
            id="address-search-dialog" 
            ref={inputRef}
            placeholder="Search for a place or address..."
        />
    </div>
  )
}
