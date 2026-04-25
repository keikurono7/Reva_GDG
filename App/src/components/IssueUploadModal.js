import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, MapPin, Navigation } from "lucide-react";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { app } from "../services/firebase_";

const db = getFirestore(app);

export default function IssueUploadModal({ onClose }) {
  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Pratinidhi_user") || "null")
      : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState("");
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Get current location on mount
  useEffect(() => {
    // Load Google Maps API script
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API loaded");
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps API. Check your API key.");
      };
      document.head.appendChild(script);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setSelectedLocation({ lat: latitude, lng: longitude });
          reverseGeocodeLocation(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to India center
          setCurrentLocation({ lat: 20.5937, lng: 78.9629 });
          setSelectedLocation({ lat: 20.5937, lng: 78.9629 });
        }
      );
    }
  }, []);

  // Initialize map when component and location data are ready
  useEffect(() => {
    if (mapRef.current && selectedLocation && !mapInitialized && window.google) {
      initializeMap();
    }
  }, [selectedLocation, mapInitialized]);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const mapOptions = {
      zoom: 15,
      center: selectedLocation,
      mapTypeControl: true,
      fullscreenControl: true,
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Create draggable marker
    const marker = new window.google.maps.Marker({
      position: selectedLocation,
      map: map,
      draggable: true,
      title: "Issue Location (Drag to adjust)",
    });

    markerRef.current = marker;

    // Update location when marker is dragged
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      setSelectedLocation({
        lat: pos.lat(),
        lng: pos.lng(),
      });
      reverseGeocodeLocation(pos.lat(), pos.lng());
    });

    // Update location on map click
    map.addListener("click", (e) => {
      marker.setPosition(e.latLng);
      setSelectedLocation({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
      reverseGeocodeLocation(e.latLng.lat(), e.latLng.lng());
    });

    setMapInitialized(true);
  };

  const reverseGeocodeLocation = async (lat, lng) => {
    if (!window.google) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results && response.results[0]) {
        setLocationAddress(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        setCurrentLocation({ lat: latitude, lng: longitude });
        reverseGeocodeLocation(latitude, longitude);

        if (mapInstanceRef.current && markerRef.current) {
          const newCenter = { lat: latitude, lng: longitude };
          mapInstanceRef.current.setCenter(newCenter);
          markerRef.current.setPosition(newCenter);
        }
      });
    }
  };

  const convertImageToBytes = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target.result);
        // Convert bytes to binary string in chunks to avoid stack overflow
        let binaryString = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binaryString += String.fromCharCode.apply(
            null,
            bytes.subarray(i, i + chunkSize)
          );
        }
        resolve({
          _byteString: {
            binaryString: binaryString,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !image) {
      return alert("Please fill in all required fields and upload an image.");
    }

    if (!selectedLocation) {
      return alert("Please select a location on the map.");
    }

    setLoading(true);

    try {
      // Convert image to bytes
      const imageBlob = await convertImageToBytes(image);

      const docRef = await addDoc(collection(db, "issues"), {
        title: title.trim(),
        description: description.trim(),
        author: session?.username || "Anonymous",
        image_blob: imageBlob,
        location: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: locationAddress || "Location set",
        },
        status: "Open",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      console.log("Issue submitted successfully with ID:", docRef.id);
      alert("Issue reported successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      setSelectedLocation(null);
      setLocationAddress("");
      
      onClose();
    } catch (err) {
      console.error("Error uploading issue:", err);
      alert("Error uploading issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-6 z-10">
          <h3 className="text-2xl font-bold">Report an Issue</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pothole on Main Street"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows="4"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload Image *
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
                required
              />
              <label
                htmlFor="image-input"
                className="block w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition"
              >
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-slate-700">Click to upload an image</p>
                <p className="text-sm text-slate-500">PNG, JPG, GIF up to 5MB</p>
              </label>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-2xl"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location *
            </label>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                <Navigation className="w-4 h-4" />
                Use Current Location
              </button>
            </div>

            <div
              ref={mapRef}
              className="w-full h-80 rounded-2xl border border-slate-200 bg-slate-100"
              style={{ minHeight: "320px" }}
            />

            {locationAddress && (
              <div className="mt-3 p-3 bg-amber-50 rounded-2xl">
                <p className="text-sm text-slate-600">
                  <strong>Address:</strong> {locationAddress}
                </p>
                {selectedLocation && (
                  <p className="text-xs text-slate-500 mt-1">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Report Issue"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
