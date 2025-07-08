
"use client";

import { useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
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
import { mockLocations } from "@/lib/mock-data";
import type { Location } from "@/lib/types";

export function LocationSelector() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(mockLocations[0]);
  const [deliveryPin, setDeliveryPin] = useState<{lat: number; lng: number} | null>(null);
  const [isSettingPin, setIsSettingPin] = useState(false);
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

  const handleSetPinClick = () => {
    setIsSettingPin(!isSettingPin);
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (isSettingPin && event.latLng) {
      setDeliveryPin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      setIsSettingPin(false);
    }
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Select Location</CardTitle>
          <CardDescription>
            {isSettingPin ? 'Click on the map to set your delivery location.' : 'Choose a pickup location or set a delivery address.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Select
            defaultValue={selectedLocation.id}
            onValueChange={(id) => {
              const location = mockLocations.find((l) => l.id === id);
              if (location) setSelectedLocation(location);
            }}
          >
            <SelectTrigger>
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
          <div className="h-[300px] w-full rounded-md overflow-hidden border">
            <Map
              center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              zoom={13}
              mapId="pluto_brew_map"
              onClick={handleMapClick}
              gestureHandling={'greedy'}
            >
              <AdvancedMarker
                position={{
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                }}
                title={"Pickup Location"}
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
          <Button variant="outline" onClick={handleSetPinClick}>{isSettingPin ? "Cancel" : "Set Delivery Pin"}</Button>
        </CardContent>
      </Card>
    </APIProvider>
  );
}
