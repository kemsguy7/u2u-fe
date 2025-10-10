'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: You'll need to set up Firebase client config
// For now, we'll use fetch to get location from our backend API

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface LiveMapProps {
  riderId: number;
  pickupAddress: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  destinationAddress?: string;
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface RiderLocation {
  lat: number;
  lng: number;
  heading?: number;
  timestamp: number;
}

export default function LiveMap({
  riderId,
  pickupAddress,
  pickupCoordinates,
  destinationAddress,
  destinationCoordinates,
}: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const [distance, setDistance] = useState<string>('--');
  const routeLayerId = 'route-layer';

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [3.3792, 6.5244],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (pickupCoordinates) {
      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([pickupCoordinates.lng, pickupCoordinates.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup</strong><br/>${pickupAddress}`))
        .addTo(map.current);
    }

    if (destinationCoordinates) {
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([destinationCoordinates.lng, destinationCoordinates.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`<strong>Destination</strong><br/>${destinationAddress}`),
        )
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  });

  // Poll rider location every 5 seconds
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/v1/location/${riderId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            setRiderLocation(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);

    return () => clearInterval(interval);
  }, [riderId]);

  // Update rider marker
  useEffect(() => {
    if (!map.current || !riderLocation) return;

    if (riderMarker.current) {
      riderMarker.current.setLngLat([riderLocation.lng, riderLocation.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg';
      el.innerHTML = '🚗';
      el.style.fontSize = '20px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      riderMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([riderLocation.lng, riderLocation.lat])
        .addTo(map.current);
    }

    if (pickupCoordinates) {
      fetchRoute(
        [riderLocation.lng, riderLocation.lat],
        [pickupCoordinates.lng, pickupCoordinates.lat],
      );
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([riderLocation.lng, riderLocation.lat]);
      bounds.extend([pickupCoordinates.lng, pickupCoordinates.lat]);
      map.current.fitBounds(bounds, { padding: 80 });
    }
  }, [riderLocation, pickupCoordinates]);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationMinutes = Math.round(route.duration / 60);
        const distanceKm = (route.distance / 1000).toFixed(1);

        setEta(`${durationMinutes} min`);
        setDistance(`${distanceKm} km`);
        drawRoute(route.geometry);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const drawRoute = (geometry: GeoJSON.Geometry) => {
    if (!map.current) return;

    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeLayerId)) {
      map.current.removeSource(routeLayerId);
    }

    map.current.addSource(routeLayerId, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry },
    });

    map.current.addLayer({
      id: routeLayerId,
      type: 'line',
      source: routeLayerId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#22c55e', 'line-width': 4, 'line-opacity': 0.8 },
    });
  };
  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
      {riderLocation && (
        <div className="absolute top-4 left-4 rounded-lg bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">ETA: {eta}</p>
              <p className="text-xs text-gray-600">{distance} away</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
