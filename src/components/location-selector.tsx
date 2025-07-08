
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
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
import { Home, Briefcase, MapPin } from "lucide-react";

interface LocationSelectorProps {
  onLocationChange: (location: LocationInfo | null) => void;
}

const AddressIcon = ({ alias }: { alias: string }) => {
  if (alias.toLowerCase().includes('home')) return <Home className="h-5 w-5 mr-3 shrink-0" />;
  if (alias.toLowerCase().includes('work')) return <Briefcase className="h-5 w-5 mr-3 shrink-0" />;
  return <MapPin className="h-5 w-5 mr-3 shrink-0" />
}

function MapControl({ onLocationChange }: LocationSelectorProps) {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliverySelection, setDeliverySelection] = useState<string>('search');
  
  const [allLocations, setAllLocations] = useState<LocationType[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<LocationType | null>(null);
  const [deliverySource, setDeliverySource] = useState<LocationType | null>(null);
  
  const [deliveryPin, setDeliveryPin] = useState<{lat: number; lng: number} | null>(null);
  const [address, setAddress] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 49.0069, lng: 8.4037 });
  
  const { user } = useAuth();
  const map = useMap();

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
  
  // Effect to update the final location info passed to the parent (cart page)
  useEffect(() => {
    if (deliveryType === 'pickup') {
      if (selectedPickupLocation) {
        onLocationChange({ type: 'pickup', address: selectedPickupLocation.name, location: selectedPickupLocation });
        setMapCenter({ lat: selectedPickupLocation.lat, lng: selectedPickupLocation.lng });
      } else {
        onLocationChange(null);
      }
    } else { // delivery
      if (address && deliverySource) {
        onLocationChange({ type: 'delivery', address, location: deliverySource });
        if (deliveryPin) setMapCenter(deliveryPin);
      } else {
        onLocationChange(null);
      }
    }
  }, [deliveryType, selectedPickupLocation, address, deliveryPin, deliverySource, onLocationChange]);

  // Effect to handle switching between saved addresses and search
  useEffect(() => {
    if (deliveryType === 'delivery') {
      if (deliverySelection.startsWith('addr_')) {
        const savedAddr = user?.savedAddresses?.find(a => a.id === deliverySelection);
        if (savedAddr) {
          setDeliveryPin({ lat: savedAddr.lat, lng: savedAddr.lng });
          setAddress(savedAddr.address);
          if (map) map.panTo({ lat: savedAddr.lat, lng: savedAddr.lng });
        }
      } else {
        // Switched to search, clear old address info if it wasn't from search
        setAddress('');
        setDeliveryPin(null);
      }
    }
  }, [deliverySelection, deliveryType, user?.savedAddresses, map]);


  const handlePickupLocationChange = (id: string) => {
    const location = allLocations.find((l) => l.id === id);
    if (location) {
      setSelectedPickupLocation(location);
    }
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
                <Select value={selectedPickupLocation?.id} onValueChange={handlePickupLocationChange}>
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

            <RadioGroup value={deliverySelection} onValueChange={setDeliverySelection}>
              {(user?.savedAddresses || []).map((addr: SavedAddress) => (
                <Label key={addr.id} htmlFor={addr.id} className="flex items-center p-3 -m-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={addr.id} id={addr.id} className="mr-4" />
                  <AddressIcon alias={addr.alias} />
                  <div className="flex-1">
                      <p className="font-semibold">{addr.alias}</p>
                      <p className="text-sm text-muted-foreground">{addr.address}</p>
                  </div>
                </Label>
              ))}
               <Label htmlFor="search" className="flex items-center p-3 -m-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <RadioGroupItem value="search" id="search" className="mr-4"/>
                <MapPin className="h-5 w-5 mr-3 shrink-0" />
                 <p className="font-semibold">Search for a new address</p>
              </Label>
            </RadioGroup>
          </div>
        )}

        <div className="h-[300px] w-full rounded-md overflow-hidden border">
          <Map
            center={mapCenter}
            zoom={13}
            mapId="pluto_brew_map_cart"
            gestureHandling={'greedy'}
            onClick={(e) => {
              if (deliveryType === 'delivery' && deliverySelection === 'search' && e.latLng) {
                const newPin = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                setDeliveryPin(newPin);
                setAddress(`Lat: ${newPin.lat.toFixed(6)}, Lng: ${newPin.lng.toFixed(6)}`);
              }
            }}
            clickableIcons={false}
          >
            {deliveryType === 'pickup' && allLocations.map(loc => (
                 <AdvancedMarker key={loc.id} position={{ lat: loc.lat, lng: loc.lng }} title={loc.name} />
            ))}
            {deliveryType === 'delivery' && deliveryPin && (
              <AdvancedMarker position={deliveryPin} title={"Your Delivery Location"} />
            )}
          </Map>
        </div>
        
        {deliveryType === 'delivery' && deliverySelection === 'search' && (
          <AddressSearchBox 
            onPlaceSelect={(place) => {
              if (place.geometry?.location) {
                const newPin = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setDeliveryPin(newPin);
                setAddress(place.formatted_address || '');
                if (map) map.panTo(newPin);
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}


function AddressSearchBox({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const { toast } = useToast();

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
    });
    
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelect(place);
      } else {
        toast({
          variant: 'destructive',
          title: 'Location not found',
          description: 'Please select a valid address from the suggestions.'
        })
      }
    });

    return () => {
        // Important: clean up the event listener and the autocomplete instance
        if(listener) google.maps.event.removeListener(listener);
        if (inputRef.current) {
           google.maps.event.clearInstanceListeners(inputRef.current);
        }
    }
  }, [places, onPlaceSelect, toast]);

  return (
    <div className="grid gap-2">
        <Label htmlFor="address-search">Search for delivery address</Label>
        <Input 
            id="address-search" 
            ref={inputRef}
            placeholder="Start typing your delivery address..."
        />
    </div>
  )
}

export function LocationSelector(props: LocationSelectorProps) {
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
      <MapControl {...props} />
    </APIProvider>
  );
}
