
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
import type { Location as LocationType, LocationInfo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const AutocompleteInput = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (!places || !inputRef.current) {
            return;
        }

        if (!autocompleteRef.current) {
            autocompleteRef.current = new places.Autocomplete(inputRef.current, {
                fields: ["geometry", "formatted_address", "name"],
                types: ["address"],
            });
        }
        
        const listener = autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place) {
                onPlaceSelect(place);
            }
        });

        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [places, onPlaceSelect]);
    
    return (
        <Input 
            id="address-search" 
            ref={inputRef}
            placeholder="Start typing your delivery address..."
        />
    );
};

function MapControl({ onLocationChange }: MapControlProps) {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  
  const [allLocations, setAllLocations] = useState<LocationType[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<LocationType | null>(null);
  const [deliverySource, setDeliverySource] = useState<LocationType | null>(null);
  
  const [deliveryPin, setDeliveryPin] = useState<{lat: number; lng: number} | null>(null);
  const [address, setAddress] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 49.0069, lng: 8.4037 });
  
  const geocodingLib = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if(geocodingLib) {
        setGeocoder(new geocodingLib.Geocoder());
    }
  }, [geocodingLib]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getLocations();
      setAllLocations(locations);
      if (locations.length > 0) {
        const defaultLocation = locations[0];
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
    } else {
      if (address && deliverySource) {
        onLocationChange({ type: 'delivery', address, location: deliverySource });
        if (deliveryPin) setMapCenter(deliveryPin);
      } else {
        onLocationChange(null);
      }
    }
  }, [deliveryType, selectedPickupLocation, address, deliveryPin, deliverySource, onLocationChange]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location && inputRef.current) {
        const newPin = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };
        const formattedAddress = place.formatted_address || place.name || '';
        
        setDeliveryPin(newPin);
        setMapCenter(newPin);
        setAddress(formattedAddress);
        setLatInput(newPin.lat.toString());
        setLngInput(newPin.lng.toString());
        inputRef.current.value = formattedAddress;
        
        toast({ title: 'Location Found', description: `Pin set for ${formattedAddress}` });
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

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
    const newAddress = `Lat: ${lat}, Lng: ${lng}`;
    setAddress(newAddress); 
    if (inputRef.current) {
        inputRef.current.value = newAddress;
    }
    toast({ title: 'Location Set', description: `Pin set to ${newAddress}` });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (deliveryType !== 'delivery' || !e.latLng || !geocoder) return;
    const newPin = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setDeliveryPin(newPin);
    setLatInput(newPin.lat.toFixed(6));
    setLngInput(newPin.lng.toFixed(6));
    
    geocoder.geocode({ location: e.latLng }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
            const newAddress = results[0].formatted_address;
            setAddress(newAddress);
            if (inputRef.current) {
                inputRef.current.value = newAddress;
            }
            toast({ title: "Location Set", description: `Delivery address updated.` });
        } else {
            const newAddress = `Lat: ${newPin.lat.toFixed(6)}, Lng: ${newPin.lng.toFixed(6)}`;
            setAddress(newAddress); 
            if (inputRef.current) {
                inputRef.current.value = newAddress;
            }
            toast({ title: "Location Set", variant: "destructive", description: "Could not find address. Using coordinates." });
        }
    });
  }

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
        )}

        <div className="h-[300px] w-full rounded-md overflow-hidden border">
          <Map
            center={mapCenter}
            zoom={13}
            mapId="pluto_brew_map"
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
             {deliveryType === 'delivery' && deliveryPin && (
              <AdvancedMarker 
                  position={deliveryPin} 
                  title={"Your Delivery Location"}
              />
            )}
          </Map>
        </div>
        
        {deliveryType === 'delivery' && (
             <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="address-search">Search for delivery address</Label>
                    <AutocompleteInput onPlaceSelect={handlePlaceSelect} />
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
