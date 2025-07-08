"use client";

import { useState, useEffect } from "react";
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
  
  const geocodingLib = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!geocodingLib) return;
    setGeocoder(new geocodingLib.Geocoder());
  }, [geocodingLib]);

  useEffect(() => {
    if (!deliveryPin) {
      setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [selectedLocation, deliveryPin]);

  const handleAddressSearch = () => {
    if (!geocoder || !address) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter an address.' });
      return;
    }
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newPin = { lat: location.lat(), lng: location.lng() };
        setDeliveryPin(newPin);
        setMapCenter(newPin);
        toast({ title: 'Location Found', description: `Pin set for ${results[0].formatted_address}` });
      } else {
        toast({ variant: 'destructive', title: 'Geocode Error', description: `Could not find location: ${status}` });
      }
    });
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Select Location</CardTitle>
        <CardDescription>
          Choose a pickup location or set a delivery address by searching or entering coordinates.
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
            <div className="flex gap-2">
                <Input 
                    id="address-search" 
                    placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                />
                <Button onClick={handleAddressSearch}>Search</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <div className="grid gap-2">
                <Label htmlFor="lat-input">Latitude</Label>
                <Input 
                    id="lat-input" 
                    placeholder="e.g., 37.422"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="lng-input">Longitude</Label>
                <Input 
                    id="lng-input" 
                    placeholder="e.g., -122.084"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                />
            </div>
            <Button onClick={handleCoordinateSet} className="w-full">Set Pin</Button>
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
    <APIProvider apiKey={apiKey}>
      <MapControl />
    </APIProvider>
  );
}
