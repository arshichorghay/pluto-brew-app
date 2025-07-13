
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
import { getLocations } from "@/lib/storage";
import type { Location as LocationType, LocationInfo, SavedAddress } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAuth } from "@/context/auth-context";

interface MapControlProps {
  onLocationChange: (location: LocationInfo | null) => void;
}

function MapControl({ onLocationChange }: MapControlProps) {
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryOption, setDeliveryOption] = useState<string>('new');
  
  const [allLocations, setAllLocations] = useState<LocationType[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<LocationType | null>(null);
  const [deliverySource, setDeliverySource] = useState<LocationType | null>(null);
  
  const [deliveryPin, setDeliveryPin] = useState<{lat: number; lng: number} | null>(null);
  const [address, setAddress] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 49.0069, lng: 8.4037 });
  
  const placesLib = useMapsLibrary('places');
  const addressInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getLocations();
      setAllLocations(locations);
      if (locations.length > 0) {
        const defaultLocation = locations.find(l => l.name.includes("KIT Campus")) || locations[0];
        setSelectedPickupLocation(defaultLocation);
        setDeliverySource(defaultLocation);
        setMapCenter({ lat: defaultLocation.lat, lng: defaultLocation.lng });
      }
    };
    fetchLocations();
  }, []);
  
  useEffect(() => {
    if (deliveryType === 'pickup') {
      if (selectedPickupLocation) {
        onLocationChange({ type: 'pickup', address: selectedPickupLocation.name, location: selectedPickupLocation });
        setMapCenter({ lat: selectedPickupLocation.lat, lng: selectedPickupLocation.lng });
      } else {
        onLocationChange(null);
      }
    } else { // Delivery
        if (deliveryOption === 'new') {
            if (address && deliverySource) {
                onLocationChange({ type: 'delivery', address, location: deliverySource });
                if (deliveryPin) setMapCenter(deliveryPin);
            } else {
                onLocationChange(null);
            }
        } else { // Saved address
            const savedAddress = user?.savedAddresses?.find(a => a.id === deliveryOption);
            if (savedAddress && deliverySource) {
                onLocationChange({ type: 'delivery', address: savedAddress.address, location: deliverySource, addressId: savedAddress.id });
                setMapCenter({ lat: savedAddress.lat, lng: savedAddress.lng });
            } else {
                onLocationChange(null);
            }
        }
    }
  }, [deliveryType, selectedPickupLocation, address, deliveryPin, deliverySource, onLocationChange, deliveryOption, user]);


  useEffect(() => {
    if (!placesLib || !addressInputRef.current || deliveryType !== 'delivery' || deliveryOption !== 'new') {
      return;
    }

    const autocomplete = new placesLib.Autocomplete(addressInputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
    });

    const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place?.geometry?.location) {
            const newPin = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setDeliveryPin(newPin);
            const formattedAddress = place.formatted_address || place.name || '';
            setAddress(formattedAddress);
            setLatInput(newPin.lat.toString());
            setLngInput(newPin.lng.toString());
            if (addressInputRef.current) {
                addressInputRef.current.value = formattedAddress;
            }
            if (newPin) setMapCenter(newPin);
            toast({ title: 'Location Found', description: `Pin set for ${formattedAddress}` });
        }
    });

    return () => {
        // Important: clean up the listener and the DOM element
        google.maps.event.removeListener(listener);
        if (addressInputRef.current) {
            google.maps.event.clearInstanceListeners(addressInputRef.current);
        }
        const pacContainers = document.getElementsByClassName('pac-container');
        for (let i = 0; i < pacContainers.length; i++) {
            pacContainers[i].remove();
        }
    };
  }, [placesLib, toast, deliveryType, deliveryOption]);

  const handleCoordinateSet = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({ variant: 'destructive', title: 'Invalid Coordinates', description: 'Please enter valid latitude and longitude.' });
      return;
    }
    const newPin = { lat, lng };
    setDeliveryPin(newPin);
    const newAddress = `Lat: ${lat}, Lng: ${lng}`;
    setAddress(newAddress); 
    if (addressInputRef.current) {
        addressInputRef.current.value = newAddress;
    }
    setMapCenter(newPin);
    toast({ title: 'Location Set', description: `Pin set to ${newAddress}` });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (deliveryType !== 'delivery' || deliveryOption !== 'new' || !e.latLng) return;
    const newPin = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setDeliveryPin(newPin);
    setLatInput(newPin.lat.toFixed(6));
    setLngInput(newPin.lng.toFixed(6));
    const newAddress = `Lat: ${newPin.lat.toFixed(6)}, Lng: ${newPin.lng.toFixed(6)}`;
    setAddress(newAddress); 
    if (addressInputRef.current) {
        addressInputRef.current.value = newAddress;
    }
    setMapCenter(newPin);
    toast({ title: "Location Set", description: "Delivery pin updated on the map." });
  }

  const currentMapPin = deliveryType === 'delivery' 
    ? (deliveryOption === 'new' ? deliveryPin : user?.savedAddresses?.find(a => a.id === deliveryOption))
    : null;

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
            <div>
                <Label className="text-sm font-medium">Deliver from store</Label>
                <Select
                value={deliverySource?.id}
                onValueChange={(id) => {
                    const location = allLocations.find((l) => l.id === id);
                    if (location) setDeliverySource(location);
                }}
                >
                <SelectTrigger className="mt-2">
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
            <div>
              <Label className="text-sm font-medium">Delivery Address</Label>
              <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption} className="mt-2 grid gap-2">
                {user?.savedAddresses?.map(addr => (
                   <div key={addr.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={addr.id} id={addr.id} />
                      <Label htmlFor={addr.id} className="font-normal w-full">
                        <span className="font-semibold">{addr.alias}</span>: <span className="text-muted-foreground">{addr.address}</span>
                      </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="font-normal">Use a new address</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        <div className="h-[300px] w-full rounded-md overflow-hidden border">
          <Map
            center={mapCenter}
            zoom={13}
            mapId="pluto_brew_map_cart"
            gestureHandling={'greedy'}
            onClick={handleMapClick}
            clickableIcons={false}
          >
            {deliveryType === 'pickup' && allLocations.map(loc => (
                 <AdvancedMarker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    title={loc.name}
                />
            ))}
             {deliveryType === 'delivery' && currentMapPin && (
              <AdvancedMarker 
                  position={{ lat: currentMapPin.lat, lng: currentMapPin.lng }} 
                  title={"Your Delivery Location"}
              />
            )}
          </Map>
        </div>
        
        {deliveryType === 'delivery' && deliveryOption === 'new' && (
             <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="address-search">Search for delivery address</Label>
                    <Input 
                        id="address-search" 
                        ref={addressInputRef}
                        placeholder="Start typing your delivery address..."
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
