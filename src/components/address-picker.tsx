
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Map, AdvancedMarker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

interface AddressPickerProps {
    onLocationSelect: (location: { address: string; lat: number; lng: number } | null) => void;
    initialLocation?: { address: string; lat: number; lng: number };
}

export function AddressPicker({ onLocationSelect, initialLocation }: AddressPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
    const [address, setAddress] = useState<string>(initialLocation?.address || "");
    const [latInput, setLatInput] = useState<string>(initialLocation?.lat.toString() || "");
    const [lngInput, setLngInput] = useState<string>(initialLocation?.lng.toString() || "");
    const [mapCenter, setMapCenter] = useState(initialLocation || { lat: 49.0069, lng: 8.4037 });
    
    const placesLib = useMapsLibrary('places');
    const geocodingLib = useMapsLibrary('geocoding');
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if(geocodingLib) {
            setGeocoder(new geocodingLib.Geocoder());
        }
    }, [geocodingLib]);

    // This useEffect handles initializing the Autocomplete instance.
    // It's based on the user's working code example to ensure stability.
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

        // This is the CRITICAL fix. It cleans up listeners to prevent conflicts.
        return () => {
            listener.remove();
            if (inputRef.current) {
                google.maps.event.clearInstanceListeners(inputRef.current);
            }
            const pacContainers = document.querySelectorAll('.pac-container');
            pacContainers.forEach(container => container.remove());
        };
    }, [placesLib, toast, updateLocationState]);
    
    useEffect(() => {
        if (inputRef.current && initialLocation?.address) {
            inputRef.current.value = initialLocation.address;
        }
    }, [initialLocation]);

    useEffect(() => {
        if(pin && address) {
            onLocationSelect({ address, lat: pin.lat, lng: pin.lng });
        } else {
            onLocationSelect(null);
        }
    }, [pin, address, onLocationSelect]);
    
    const updateLocationState = useCallback((newPin: { lat: number; lng: number }, newAddress: string) => {
        setPin(newPin);
        setMapCenter(newPin);
        setAddress(newAddress);
        setLatInput(newPin.lat.toString());
        setLngInput(newPin.lng.toString());
        if (inputRef.current) {
            inputRef.current.value = newAddress;
        }
    }, []);

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
                    defaultValue={initialLocation?.address || ''}
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
    )
}
