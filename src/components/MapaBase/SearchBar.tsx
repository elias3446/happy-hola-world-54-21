
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from '@/components/ui/sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  getPredictiveSuggestions,
  getMatchingPopularLocations
} from '@/utils/searchUtils';
import { searchLocation, reverseGeocode } from '@/utils/nominatimUtils';

interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

interface SearchBarProps {
  onSearch: (location: Location) => void;
  userPosition?: [number, number] | null;
}

const SearchBar = ({ onSearch, userPosition }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [predictiveSuggestions, setPredictiveSuggestions] = useState<string[]>([]);
  const [popularSuggestions, setPopularSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userLocationLabel, setUserLocationLabel] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Get user location when userPosition changes using new utility
  useEffect(() => {
    const getUserLocation = async () => {
      if (userPosition) {
        try {
          const [lat, lon] = userPosition;
          const data = await reverseGeocode(lat, lon);
          
          // Set simple label for current location
          let locationLabel = "Ubicación actual";
          
          if (data && data.address) {
            // Get more specific components
            const cityName = data.address.city || data.address.town || data.address.village;
            const roadName = data.address.road;
            
            if (roadName && cityName) {
              locationLabel = `${roadName}, ${cityName}`;
            } else if (cityName) {
              locationLabel = cityName;
            } else if (roadName) {
              locationLabel = roadName;
            }
            
            // Save country code to filter local results
            if (data.address.country_code) {
              setUserCountry(data.address.country_code);
            }
          }
          
          setUserLocationLabel(locationLabel);
          
        } catch (error) {
          console.error('Error obteniendo la ubicación del usuario:', error);
          setUserLocationLabel('Ubicación actual');
        }
      }
    };

    getUserLocation();
  }, [userPosition]);

  // Update suggestions when search query changes using new utility
  useEffect(() => {
    // Update predictive suggestions immediately (no API needed)
    const updatedPredictiveSuggestions = getPredictiveSuggestions(searchQuery);
    setPredictiveSuggestions(updatedPredictiveSuggestions);
    
    // Update popular location suggestions
    const updatedPopularSuggestions = getMatchingPopularLocations(searchQuery);
    setPopularSuggestions(updatedPopularSuggestions);
    
    // Only search API if there's enough text
    if (searchQuery.trim().length >= 3) {
      const searchLocations = async () => {
        try {
          setIsSearching(true);
          const data = await searchLocation(searchQuery, userCountry || undefined);
          setSuggestions(data.slice(0, 15));
        } catch (error) {
          console.error('Error buscando sugerencias:', error);
          toast.error('Error al buscar sugerencias. Verifique su conexión a internet.');
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      };

      const timeoutId = setTimeout(searchLocations, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, userCountry]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleSelectLocation = (location: Location) => {
    setSearchQuery(location.display_name.split(',')[0]);
    setShowSuggestions(false);
    onSearch(location);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    // Don't hide suggestions to allow user to see results based on suggestion
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0]);
    } else if (searchQuery.trim()) {
      toast.info('Buscando...');
    }
  };

  const handleUseCurrentLocation = () => {
    if (userPosition && userLocationLabel) {
      const userLoc: Location = {
        lat: userPosition[0],
        lon: userPosition[1],
        display_name: userLocationLabel
      };
      onSearch(userLoc);
      setSearchQuery(userLocationLabel.split(',')[0]);
      setShowSuggestions(false);
      toast.success("Usando tu ubicación actual");
    }
  };

  return (
    <div className={`absolute z-10 ${
      isMobile 
        ? 'top-2 left-2 right-2' 
        : 'top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4'
    }`}>
      <div className="relative">
        <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
          <Input
            type="text"
            placeholder={isMobile ? "Buscar..." : "Buscar ubicación..."}
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`flex-1 pr-10 bg-white shadow-lg ${isMobile ? 'text-sm' : ''}`}
            autoComplete="off"
          />
          <Button 
            type="button" 
            size={isMobile ? "sm" : "icon"}
            disabled={isSearching}
            onClick={handleSubmit}
            className="bg-white hover:bg-gray-100 shadow-lg shrink-0"
          >
            <Search className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-600`} />
          </Button>
        </div>

        {showSuggestions && (searchQuery.trim() || userPosition) && (
          <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border w-full ${
            isMobile ? 'max-h-[60vh]' : 'max-h-[70vh]'
          }`}>
            {userPosition && userLocationLabel && (
              <div 
                className={`flex items-center gap-2 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  isMobile ? 'p-2' : ''
                }`}
                onClick={handleUseCurrentLocation}
              >
                <div className="flex-1">
                  <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                    Tu ubicación actual
                  </div>
                  <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {userLocationLabel}
                  </div>
                </div>
              </div>
            )}

            <ScrollArea className={isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'}>
              <Command className="w-full">
                <CommandList>
                  <CommandEmpty>No hay resultados</CommandEmpty>
                  <CommandGroup>
                    {/* Predictive suggestions for place types */}
                    {predictiveSuggestions.length > 0 && (
                      <div className={`p-2 border-b border-gray-100 ${isMobile ? 'p-1' : ''}`}>
                        <div className={`font-medium text-gray-500 px-2 py-1 ${
                          isMobile ? 'text-xs px-1' : 'text-sm'
                        }`}>
                          Tipos de lugares
                        </div>
                        {predictiveSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={`predict-${index}`}
                            onSelect={() => handleSelectSuggestion(suggestion)}
                            className={`cursor-pointer hover:bg-gray-50 ${
                              isMobile ? 'py-1 px-2 text-sm' : 'py-2 px-4'
                            }`}
                          >
                            <Search className={`mr-2 text-gray-400 ${
                              isMobile ? 'h-3 w-3' : 'h-4 w-4'
                            }`} />
                            <span className={isMobile ? 'text-sm' : ''}>{suggestion}</span>
                          </CommandItem>
                        ))}
                      </div>
                    )}

                    {/* Popular locations that match the search */}
                    {popularSuggestions.length > 0 && (
                      <div className={`p-2 border-b border-gray-100 ${isMobile ? 'p-1' : ''}`}>
                        <div className={`font-medium text-gray-500 px-2 py-1 ${
                          isMobile ? 'text-xs px-1' : 'text-sm'
                        }`}>
                          Lugares populares
                        </div>
                        {popularSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={`popular-${index}`}
                            onSelect={() => handleSelectSuggestion(suggestion)}
                            className={`cursor-pointer hover:bg-gray-50 ${
                              isMobile ? 'py-1 px-2 text-sm' : 'py-2 px-4'
                            }`}
                          >
                            <Search className={`mr-2 text-gray-400 ${
                              isMobile ? 'h-3 w-3' : 'h-4 w-4'
                            }`} />
                            <span className={isMobile ? 'text-sm' : ''}>{suggestion}</span>
                          </CommandItem>
                        ))}
                      </div>
                    )}

                    {/* API results */}
                    {suggestions.length > 0 && (
                      <div className={`p-2 ${isMobile ? 'p-1' : ''}`}>
                        <div className={`font-medium text-gray-500 px-2 py-1 ${
                          isMobile ? 'text-xs px-1' : 'text-sm'
                        }`}>
                          Resultados de búsqueda
                        </div>
                        {suggestions.map((suggestion, index) => (
                          <CommandItem
                            key={`result-${index}`}
                            onSelect={() => handleSelectLocation(suggestion)}
                            className={`cursor-pointer hover:bg-gray-50 ${
                              isMobile ? 'py-2 px-2' : 'py-3 px-4'
                            }`}
                          >
                            <div className="flex flex-col w-full">
                              <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                                {suggestion.display_name.split(',')[0]}
                              </span>
                              <span className={`text-gray-500 truncate ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>
                                {suggestion.display_name.split(',').slice(1, 4).join(',')}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
