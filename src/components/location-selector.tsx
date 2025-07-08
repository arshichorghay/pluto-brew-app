
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, useMapsLibrary, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLocations } from "@/lib/storage";
import type { Location as LocationType, LocationInfo } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

function ManualAddressEntry({ onLocationSelect }: { onLocationSelect: (location: { address: string; lat: number; lng: number } | null) => void}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string>("");
    const [latInput, setLatInput] = useState<string>("");
    const [lngInput, setLngInput] = useState<string>("");
    const [mapCenter, setMapCenter] = useState({ lat: 49.0069, lng: 8.4037 });
    
    const placesLib = useMapsLibrary('places');
    const geocodingLib = useMapsLibrary('geocoding');
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
    const { toast } = useToast();

    const updateLocationState = useCallback((newPin: { lat: number; lng: number }, newAddress: string) => {
        setPin(newPin);
        setMapCenter(newPin);
        setAddress(newAddress);
        setLatInput(newPin.lat.toString());
        setLngInput(newPin.lng.toString());
        if (inputRef.current) {
            inputRef.current.value = newAddress;
        }
        onLocationSelect({ address: newAddress, lat: newPin.lat, lng: newPin.lng });
    }, [onLocationSelect]);

    useEffect(() => {
        if(geocodingLib) {
            setGeocoder(new geocodingLib.Geocoder());
        }
    }, [geocodingLib]);

    useEffect(() => {
        if (!placesLib || !inputRef.current) return;
        
        const kitCampusCenter = { lat: 49.00937, lng: 8.41656 };
        const autocomplete = new placesLib.Autocomplete(inputRef.current, {
            fields: ["place_id", "name", "formatted_address", "geometry"],
            locationBias: { center: kitCampusCenter, radius: 5000 },
            strictBounds: false,
        });

        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place?.geometry?.location && place.formatted_address) {
                const newPin = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                updateLocationState(newPin, place.formatted_address);
                toast({ title: 'Location Found', description: `Pin set for ${place.formatted_address}` });
            }
        });

        return () => {
            listener.remove();
            if (inputRef.current) {
                google.maps.event.clearInstanceListeners(inputRef.current);
            }
            const pacContainers = document.querySelectorAll('.pac-container');
            pacContainers.forEach(container => container.remove());
        };
    }, [placesLib, toast, updateLocationState]);

    const handleCoordinateSet = () => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            toast({ variant: 'destructive', title: 'Invalid Coordinates', description: 'Please enter valid latitude and longitude.' });
            return;
        }
        const newPin = { lat, lng };
        if (geocoder) {
            geocoder.geocode({ location: newPin }, (results, status) => {
                 if (status === 'OK' && results?.[0]) {
                    updateLocationState(newPin, results[0].formatted_address);
                 } else {
                    const newAddressStr = `Lat: ${lat}, Lng: ${lng}`;
                    updateLocationState(newPin, newAddressStr);
                 }
                 toast({ title: 'Location Set', description: `Pin set to Lat: ${lat}, Lng: ${lng}` });
            });
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng || !geocoder) return;
        const newPin = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        geocoder.geocode({ location: e.latLng }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
                updateLocationState(newPin, results[0].formatted_address);
                toast({ title: "Location Set", description: `Delivery address updated.` });
            } else {
                const newAddressStr = `Lat: ${newPin.lat.toFixed(6)}, Lng: ${newPin.lng.toFixed(6)}`;
                updateLocationState(newPin, newAddressStr);
                toast({ title: "Location Set", variant: "destructive", description: "Could not find address. Using coordinates." });
            }
        });
    }

    return (
        <div className="grid gap-4">
            <div className="h-[250px] w-full rounded-md overflow-hidden border">
                <Map
                    center={mapCenter}
                    zoom={13}
                    mapId="address_picker_map"
                    gestureHandling={'greedy'}
                    onClick={handleMapClick}
                    clickableIcons={false}
                >
                    {pin && <AdvancedMarker position={pin} title={"Selected Location"} />}
                </Map>
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="address-search">Search for delivery address</Label>
                <Input 
                    id="address-search" 
                    ref={inputRef}
                    placeholder="Search for a place or address..."
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
                <Button onClick={handleCoordinateSet} className="w-full">Set from Coords</Button>
            </div>
        </div>
    );
}

function MapControl({ onLocationChange }: { onLocationChange: (location: LocationInfo | null) => void }) {
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');

  const [allLocations, setAllLocations] = useState<LocationType[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<LocationType | null>(null);
  const [deliverySource, setDeliverySource] = useState<LocationType | null>(null);
  
  const savedAddresses = user?.savedAddresses || [];
  const [chosenSavedAddressId, setChosenSavedAddressId] = useState<string>('new');
  const [manualAddress, setManualAddress] = useState<{address: string, lat: number, lng: number} | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getLocations();
      setAllLocations(locations);
      if (locations.length > 0) {
        const defaultLocation = locations[0];
        setSelectedPickupLocation(defaultLocation);
        setDeliverySource(defaultLocation);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (savedAddresses.length > 0) {
      setChosenSavedAddressId(savedAddresses[0].id);
    } else {
      setChosenSavedAddressId('new');
    }
  }, [savedAddresses]);


  useEffect(() => {
    if (deliveryType === 'pickup') {
      if (selectedPickupLocation) {
        onLocationChange({ type: 'pickup', address: selectedPickupLocation.name, location: selectedPickupLocation });
      } else {
        onLocationChange(null);
      }
    } else { 
        if (!deliverySource) {
            onLocationChange(null);
            return;
        }

        if (chosenSavedAddressId === 'new') {
            if (manualAddress) {
                onLocationChange({
                    type: 'delivery',
                    address: manualAddress.address,
                    location: deliverySource,
                });
            } else {
                onLocationChange(null);
            }
        } else {
            const savedAddress = user?.savedAddresses?.find(a => a.id === chosenSavedAddressId);
            if (savedAddress) {
                onLocationChange({
                    type: 'delivery',
                    address: savedAddress.address,
                    location: deliverySource,
                    addressId: savedAddress.id,
                })
            } else {
                onLocationChange(null);
            }
        }
    }
  }, [deliveryType, selectedPickupLocation, deliverySource, chosenSavedAddressId, manualAddress, onLocationChange, user]);

  const handleManualAddressSelect = useCallback((location: {address: string; lat: number, lng: number} | null) => {
    setManualAddress(location);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Select Location</CardTitle>
        <CardDescription>
          Choose a pickup store or enter a delivery address.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <RadioGroup value={deliveryType} onValueChange={(value) => setDeliveryType(value as 'pickup' | 'delivery')} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup">Pickup</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery">Delivery</Label>
          </div>
        </RadioGroup>

        {deliveryType === 'pickup' && (
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Pickup from store</Label>
            <Select
              value={selectedPickupLocation?.id}
              onValueChange={(id) => {
                const location = allLocations.find((l) => l.id === id);
                if (location) setSelectedPickupLocation(location);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {allLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {deliveryType === 'delivery' && (
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label className="text-sm font-medium">Deliver from store</Label>
                <Select
                value={deliverySource?.id}
                onValueChange={(id) => {
                    const location = allLocations.find((l) => l.id === id);
                    if (location) setDeliverySource(location);
                }}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select a source store" />
                </SelectTrigger>
                <SelectContent>
                    {allLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                        {location.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            
            <div className="grid gap-2">
                <Label className="text-sm font-medium">Deliver To</Label>
                <RadioGroup value={chosenSavedAddressId} onValueChange={setChosenSavedAddressId} className="grid gap-3">
                    {savedAddresses.map((addr) => (
                        <Label key={addr.id} htmlFor={addr.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value={addr.id} id={addr.id} />
                            <span className="font-normal flex-1">
                                <span className="font-semibold">{addr.alias}</span>
                                <span className="block text-sm text-muted-foreground">{addr.address}</span>
                            </span>
                        </Label>
                    ))}
                    <Label htmlFor="new-address" className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="new" id="new-address" />
                        <span className="font-semibold">Use a new address</span>
                    </Label>
                </RadioGroup>
            </div>

            {chosenSavedAddressId === 'new' && (
                <div className="pl-4 border-l-2 border-dashed">
                    <ManualAddressEntry onLocationSelect={handleManualAddressSelect} />
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LocationSelector({ onLocationChange }: { onLocationChange: (location: LocationInfo | null) => void }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Google Maps API Key is missing. Please add it to your environment variables.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
      <MapControl onLocationChange={onLocationChange} />
    </APIProvider>
  );
}
