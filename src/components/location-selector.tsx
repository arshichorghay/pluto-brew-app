
"use client";

import { useState, useEffect, useCallback } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
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
import { Label } from "@/components/ui/label";
import { getLocations } from "@/lib/storage";
import type { Location as LocationType, LocationInfo, SavedAddress } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAuth } from "@/context/auth-context";
import { AddressPicker } from "./address-picker";

function MapControl({ onLocationChange }: { onLocationChange: (location: LocationInfo | null) => void }) {
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');

  const [allLocations, setAllLocations] = useState<LocationType[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<LocationType | null>(null);
  const [deliverySource, setDeliverySource] = useState<LocationType | null>(null);
  
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

  const handleSavedAddressChange = (addressId: string) => {
    setChosenSavedAddressId(addressId);
    if(addressId !== 'new') {
        setManualAddress(null);
    }
  }

  const handleManualAddressSelect = useCallback((location: {address: string; lat: number, lng: number} | null) => {
    setManualAddress(location);
  }, []);
  
  const savedAddresses = user?.savedAddresses || [];

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
          <div>
            <Label className="text-sm font-medium">Pickup from store</Label>
            <Select
              value={selectedPickupLocation?.id}
              onValueChange={(id) => {
                const location = allLocations.find((l) => l.id === id);
                if (location) setSelectedPickupLocation(location);
              }}
            >
              <SelectTrigger className="mt-2">
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
            
            {savedAddresses.length > 0 && (
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Delivery Address</Label>
                    <Select value={chosenSavedAddressId} onValueChange={handleSavedAddressChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose address..." />
                        </SelectTrigger>
                        <SelectContent>
                            {savedAddresses.map(addr => (
                                <SelectItem key={addr.id} value={addr.id}>{addr.alias} - {addr.address}</SelectItem>
                            ))}
                            <SelectItem value="new">Use a new address</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            {(savedAddresses.length === 0 || chosenSavedAddressId === 'new') && (
                <AddressPicker onLocationSelect={handleManualAddressSelect} />
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
