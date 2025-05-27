import React, { createContext, useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LocationContext = createContext();

export function useLocationContext() {
  return useContext(LocationContext);
}

export default function LocationProvider({ children }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef();

  // Debounced fetch for suggestions
  const fetchLocationSuggestions = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        const formattedSuggestions = data.map(item => ({
          name: item.display_name.split(',')[0],
          address: item.display_name,
          lat: item.lat,
          lng: item.lon,
          fullDetails: item
        }));
        setSuggestions(formattedSuggestions);
      } catch (error) {
        setSuggestions([]);
      }
    }, 300); // 300ms debounce
  };

  // Always update localStorage on select
  const onLocationSelect = (suggestion) => {
    setLocation(suggestion.address || suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    localStorage.setItem('userLocation', JSON.stringify({
      location: suggestion.address,
      coordinates: { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lng) }
    }));
    navigate('/');
  };

  const onAllowLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
              .then(response => response.json())
              .then(data => {
                const locationData = {
                  location: data.display_name,
                  coordinates: { lat: latitude, lng: longitude }
                };
                setLocation(data.display_name);
                localStorage.setItem('userLocation', JSON.stringify(locationData));
                setShowSuggestions(false);
                resolve(locationData);
              })
              .catch((error) => {
                console.error("Error getting location name:", error);
                setLocation('Current Location');
                setShowSuggestions(false);
                reject(error);
              });
          },
          (error) => {
            console.error("Error getting geolocation:", error);
            setLocation('Current Location');
            setShowSuggestions(false);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        const error = new Error("Geolocation is not supported by your browser");
        reject(error);
      }
    });
  };

  return (
    <LocationContext.Provider value={{
      location,
      setLocation,
      suggestions,
      setSuggestions,
      showSuggestions,
      setShowSuggestions,
      fetchLocationSuggestions,
      onLocationSelect,
      onAllowLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
} 