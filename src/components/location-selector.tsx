
"use client";

import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockLocations } from "@/lib/mock-data";
import type { Location } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";


function MapControl() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(mockLocations[0]);
  const [deliveryPin, setDeliveryPin] = useState<{lat: number; lng: number} | null>(null);
  const [address, setAddress] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: selectedLocation.lat, lng: selectedLocation.lng });
  
  const placesLib = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!placesLib || !addressInputRef.current) return;

    const autocompleteService = new placesLib.Autocomplete(addressInputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
        types: ["address"]
    });
    setAutocomplete(autocompleteService);
  }, [placesLib]);


  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
            const newPin = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setDeliveryPin(newPin);
            setMapCenter(newPin);
            setAddress(place.formatted_address || place.name || '');
            setLatInput(newPin.lat.toString());
            setLngInput(newPin.lng.toString());
            toast({ title: 'Location Found', description: `Pin set for ${place.formatted_address}` });
        }
    });

    return () => {
        google.maps.event.removeListener(listener);
    };
  }, [autocomplete, toast]);

  useEffect(() => {
    if (deliveryPin) {
      setMapCenter(deliveryPin);
    } else {
      setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [selectedLocation, deliveryPin]);

  const handleCoordinateSet = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({ variant: 'destructive', title: 'Invalid Coordinates', description: 'Please enter valid latitude and longitude.' });
      return;
    }
    const newPin = { lat, lng };
    setDeliveryPin(newPin);
    setMapCenter(newPin);
    toast({ title: 'Location Set', description: `Pin set to Lat: ${lat}, Lng: ${lng}` });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPin = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setDeliveryPin(newPin);
    setLatInput(newPin.lat.toFixed(6));
    setLngInput(newPin.lng.toFixed(6));
    setAddress(""); // Clear address when clicking map
    toast({ title: "Location Set", description: "Delivery pin updated on the map." });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Select Location</CardTitle>
        <CardDescription>
          Choose a pickup store, search for a delivery address, or click the map to set your location.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
            <Label className="text-sm font-medium">Pickup from store</Label>
            <Select
            defaultValue={selectedLocation.id}
            onValueChange={(id) => {
                const location = mockLocations.find((l) => l.id === id);
                if (location) setSelectedLocation(location);
            }}
            >
            <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
                {mockLocations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                    {location.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <div className="h-[300px] w-full rounded-md overflow-hidden border">
          <Map
            center={mapCenter}
            zoom={13}
            mapId="pluto_brew_map"
            gestureHandling={'greedy'}
            onClick={handleMapClick}
          >
            <AdvancedMarker
              position={{
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
              }}
              title={selectedLocation.name}
            />
            {deliveryPin && (
              <AdvancedMarker 
                  position={deliveryPin} 
                  title={"Your Delivery Location"}
              >
                  <span className="text-3xl">📍</span>
              </AdvancedMarker>
            )}
          </Map>
        </div>

        <div className="grid gap-2">
            <Label htmlFor="address-search">Search for delivery address</Label>
            <Input 
                id="address-search" 
                ref={addressInputRef}
                placeholder="Start typing your delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
      </CardContent>
    </Card>
  );
}

export function LocationSelector() {
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
      <MapControl />
    </APIProvider>
  );
}
