/**
 * Geocoding service using OpenStreetMap's Nominatim API
 * Converts addresses to latitude/longitude coordinates
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

/**
 * Convert an address string to coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} Coordinates or null if not found
 */
export const geocodeAddress = async (address) => {
  if (!address || address.trim() === "") {
    return null;
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: address,
          format: "json",
          limit: 1,
          addressdetails: 1,
        }),
      {
        headers: {
          "User-Agent": "Medlink/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.error("Geocoding API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Batch geocode multiple addresses
 * @param {Array<{id: string, address: string}>} items - Array of items with addresses
 * @returns {Promise<Array<{id: string, lat: number, lng: number}>>} Array of geocoded items
 */
export const batchGeocode = async (items) => {
  const results = [];

  // Add delay between requests to respect rate limits (1 request per second)
  for (const item of items) {
    const coords = await geocodeAddress(item.address);
    console.log("Geocoding address for item:", item.address);
    if (coords) {
      results.push({
        ...item,
        ...coords,
      });
    }
    // Wait 1 second between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Get user's current location
 * @returns {Promise<{lat: number, lng: number}>} User coordinates
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    // Try high accuracy first, then fall back to low accuracy
    const tryGetLocation = (enableHighAccuracy, timeout) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === 3 && enableHighAccuracy) {
            // Timeout with high accuracy, try again with low accuracy
            console.log("High accuracy timeout, trying low accuracy mode...");
            tryGetLocation(false, 15000);
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: enableHighAccuracy,
          timeout: timeout,
          maximumAge: enableHighAccuracy ? 0 : 300000, // Cache for 5 min in low accuracy mode
        }
      );
    };

    // Start with high accuracy
    tryGetLocation(true, 10000);
  });
};
