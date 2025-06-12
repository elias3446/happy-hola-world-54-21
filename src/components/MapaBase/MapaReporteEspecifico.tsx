
import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { MapaBase, selectedReportIcon, RecenterAutomatically } from './MapaBase';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { reverseGeocode, formatAddressForDisplay } from '@/utils/nominatimUtils';
import { WifiOff, AlertTriangle } from 'lucide-react';

interface MapaReporteEspecificoProps<T = any> {
  reporte: T;
  className?: string;
  height?: string;
}

interface AddressData {
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    suburb?: string;
    neighbourhood?: string;
    state?: string;
    country?: string;
    postcode?: string;
    amenity?: string;
    building?: string;
    tourism?: string;
    shop?: string;
  };
  lat: string;
  lon: string;
  place_id?: string;
}

const MapaReporteEspecifico: React.FC<MapaReporteEspecificoProps> = ({
  reporte,
  className,
  height
}) => {
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [addressFetched, setAddressFetched] = useState<boolean>(false);

  // Get location from reporte - either from ubicacion property or direct coordinates
  const location = reporte.ubicacion || {
    latitud: reporte.latitud,
    longitud: reporte.longitud,
    direccion: reporte.direccion,
    referencia: reporte.referencia
  };

  // Fetch address data when component mounts - but only once
  useEffect(() => {
    const fetchAddressData = async () => {
      if (!location?.latitud || !location?.longitud || addressFetched) return;
      
      try {
        setIsLoadingAddress(true);
        setHasError(false);
        
        console.log('📍 Fetching address data for:', location.latitud, location.longitud);
        const { latitud: lat, longitud: lon } = location;
        const data = await reverseGeocode(lat, lon);
        setAddressData(data);
        setAddressFetched(true);
        
      } catch (error) {
        console.error("Error fetching address from geocoding service:", error);
        setHasError(true);
        setAddressData(null);
        setAddressFetched(true); // Mark as fetched to prevent retries
      } finally {
        setIsLoadingAddress(false);
      }
    };
    
    // Only fetch if we haven't already fetched
    if (!addressFetched) {
      fetchAddressData();
    }
  }, [location, addressFetched]);

  // Don't render if no location data
  if (!location?.latitud || !location?.longitud) {
    return (
      <div className="p-4 bg-gray-100 rounded-md">
        <p className="text-gray-500">No hay información de ubicación disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MapaBase 
        className={className} 
        height={height}
        initialCenter={[location.latitud, location.longitud]}
        hideSearchBar={true}
      >
        <RecenterAutomatically position={[location.latitud, location.longitud]} maxZoom={16} />
        
        <Marker 
          {...({ 
            position: [location.latitud, location.longitud], 
            icon: selectedReportIcon 
          } as any)}
        >
          <Popup>
            <div>
              <h3 className="font-medium text-lg">{reporte.titulo || reporte.title}</h3>
              {(reporte.descripcion || reporte.description) && (
                <p className="text-sm mt-1">{reporte.descripcion || reporte.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapaBase>

      {hasError && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            No se pudo obtener información de ubicación desde los servicios de geocodificación. Mostrando solo coordenadas.
          </AlertDescription>
        </Alert>
      )}

      {reporte && (
        <div className="p-4 bg-white rounded-md shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium">Ubicación del reporte</h3>
            {hasError && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          </div>
          
          {isLoadingAddress ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : addressData ? (
            <div className="space-y-3">
              {(() => {
                const formattedAddress = formatAddressForDisplay(addressData);
                return (
                  <>
                    <div>
                      <p className="font-medium text-gray-700">Dirección:</p>
                      <p className="text-gray-900 font-medium">
                        {formattedAddress.mainAddress}
                      </p>
                    </div>
                    
                    {formattedAddress.reference && (
                      <div>
                        <p className="font-medium text-gray-700">Referencia:</p>
                        <p className="text-gray-700">
                          {formattedAddress.reference}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      ({location.latitud.toFixed(6)}, {location.longitud.toFixed(6)})
                    </div>
                  </>
                );
              })()}
            </div>
          ) : hasError ? (
            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-700">Coordenadas:</p>
                <p className="text-gray-700">
                  ({location.latitud.toFixed(6)}, {location.longitud.toFixed(6)})
                </p>
              </div>
              {location.direccion && (
                <div>
                  <p className="font-medium text-gray-700">Dirección guardada:</p>
                  <p className="text-gray-700">{location.direccion}</p>
                </div>
              )}
              {location.referencia && (
                <div>
                  <p className="font-medium text-gray-700">Referencia:</p>
                  <p className="text-gray-700">{location.referencia}</p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                No se pudo obtener información adicional de dirección
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-700">Coordenadas:</p>
                <p className="text-gray-700">
                  ({location.latitud.toFixed(6)}, {location.longitud.toFixed(6)})
                </p>
              </div>
              {location.direccion && (
                <div>
                  <p className="font-medium text-gray-700">Dirección:</p>
                  <p className="text-gray-700">{location.direccion}</p>
                </div>
              )}
              {location.referencia && (
                <div>
                  <p className="font-medium text-gray-700">Referencia:</p>
                  <p className="text-gray-700">{location.referencia}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapaReporteEspecifico;
