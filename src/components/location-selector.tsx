
"use client";

import { useState, useEffect, useCallback } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
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
import { getLocations } from "@/lib/storage";
import type { Location as LocationType, LocationInfo } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAuth } from "@/context/auth-context";
import { AddressPicker } from "./address-picker";

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

  // Set default address choice when saved addresses are loaded or change.
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
    } else { // Delivery
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
                    <AddressPicker onLocationSelect={handleManualAddressSelect} />
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
