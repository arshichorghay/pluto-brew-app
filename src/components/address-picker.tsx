
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Map, AdvancedMarker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

const AutocompleteInput = ({ onPlaceSelect, initialAddress }: { onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void, initialAddress?: string }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');

    useEffect(() => {
        if (!places || !inputRef.current) return;
        
        const kitCampusCenter = { lat: 49.00937, lng: 8.41656 };
        const autocomplete = new places.Autocomplete(inputRef.current, {
            fields: ["place_id", "name", "formatted_address", "geometry"],
            locationBias: { center: kitCampusCenter, radius: 5000 },
            strictBounds: false,
        });

        const listener = autocomplete.addListener('place_changed', () => {
            onPlaceSelect(autocomplete.getPlace());
        });

        return () => {
            listener.remove();
            const pacContainers = document.querySelectorAll('.pac-container');
            pacContainers.forEach(container => container.remove());
        };
    }, [places, onPlaceSelect]);
    
    useEffect(() => {
        if (inputRef.current && initialAddress) {
            inputRef.current.value = initialAddress;
        }
    }, [initialAddress])

    return (
        <Input 
            id="address-search" 
            ref={inputRef}
            placeholder="Search for a place or address..."
            defaultValue={initialAddress || ''}
        />
    );
};

interface AddressPickerProps {
    onLocationSelect: (location: { address: string; lat: number; lng: number } | null) => void;
    initialLocation?: { address: string; lat: number; lng: number };
}

export function AddressPicker({ onLocationSelect, initialLocation }: AddressPickerProps) {
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
    const [address, setAddress] = useState<string>(initialLocation?.address || "");
    const [latInput, setLatInput] = useState<string>(initialLocation?.lat.toString() || "");
    const [lngInput, setLngInput] = useState<string>(initialLocation?.lng.toString() || "");
    const [mapCenter, setMapCenter] = useState(initialLocation || { lat: 49.0069, lng: 8.4037 });
    
    const geocodingLib = useMapsLibrary('geocoding');
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if(geocodingLib) {
            setGeocoder(new geocodingLib.Geocoder());
        }
    }, [geocodingLib]);

    useEffect(() => {
        if(pin && address) {
            onLocationSelect({ address, lat: pin.lat, lng: pin.lng });
        } else {
            onLocationSelect(null);
        }
    }, [pin, address, onLocationSelect]);

    const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult | null) => {
        if (place?.geometry?.location) {
            const newPin = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            const newAddress = place.formatted_address || place.name || '';
            
            setPin(newPin);
            setMapCenter(newPin);
            setAddress(newAddress);
            setLatInput(newPin.lat.toString());
            setLngInput(newPin.lng.toString());
            
            toast({ title: 'Location Found', description: `Pin set for ${newAddress}` });
        }
    }, [toast]);

    const handleCoordinateSet = () => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            toast({ variant: 'destructive', title: 'Invalid Coordinates', description: 'Please enter valid latitude and longitude.' });
            return;
        }
        const newPin = { lat, lng };
        setPin(newPin);
        setMapCenter(newPin);
        
        if (geocoder) {
            geocoder.geocode({ location: newPin }, (results, status) => {
                 if (status === 'OK' && results?.[0]) {
                    setAddress(results[0].formatted_address);
                 } else {
                    const newAddressStr = `Lat: ${lat}, Lng: ${lng}`;
                    setAddress(newAddressStr);
                 }
            });
        }
        toast({ title: 'Location Set', description: `Pin set to Lat: ${lat}, Lng: ${lng}` });
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng || !geocoder) return;
        
        const newPin = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setPin(newPin);
        setLatInput(newPin.lat.toFixed(6));
        setLngInput(newPin.lng.toFixed(6));
        
        geocoder.geocode({ location: e.latLng }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
                const newAddress = results[0].formatted_address;
                setAddress(newAddress);
                toast({ title: "Location Set", description: `Delivery address updated.` });
            } else {
                const newAddressStr = `Lat: ${newPin.lat.toFixed(6)}, Lng: ${newPin.lng.toFixed(6)}`;
                setAddress(newAddressStr);
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
                <AutocompleteInput onPlaceSelect={handlePlaceSelect} initialAddress={address} />
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
