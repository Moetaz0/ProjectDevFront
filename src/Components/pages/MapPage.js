import React, { useState, useEffect, useContext, useMemo } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { LanguageContext } from "../../context/LanguageContext";
import { getAllDoctors } from "../../services/api";
import {
  geocodeAddress,
  getCurrentLocation,
  calculateDistance,
} from "../../services/geocoding";

// ---------- Marker Helpers ----------
const createCustomIcon = (color, iconKey) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        ${getIconSVG(iconKey)}
      </svg>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const getIconSVG = (iconKey) => {
  const icons = {
    hospital:
      '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="white"/>',
    doctor:
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>',
    lab: '<path d="M7 2v2h1v14c0 2.21 1.79 4 4 4s4-1.79 4-4V4h1V2H7zm4 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-4H10v-2h4v2z" fill="white"/>',
    pharmacy:
      '<path d="M21 5h-2.64l1.14-3.14L17.15 1l-1.46 4H3v2l2 6-2 6v2h18v-2l-2-6 2-6V5zm-5 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>',
  };
  return icons[iconKey] || icons.doctor;
};

const ROLE_ICONS = {
  CLIENT: { color: "#6b7280", icon: "client" },
  DOCTOR: { color: "#4addbf", icon: "doctor" },
  HOSPITAL: { color: "#ef4444", icon: "hospital" },
  LAB: { color: "#3b82f6", icon: "lab" },
  PHARMACY: { color: "#10b981", icon: "pharmacy" },
};

// ---------- Map Updater ----------
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
};

// ---------- Main Component ----------
const MapPage = () => {
  const { t } = useContext(LanguageContext);

  const [mapCenter, setMapCenter] = useState([36.8065, 10.1815]); // Tunis
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(
    JSON.parse(localStorage.getItem("selectedFilters")) || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const doctorSpecialties = useMemo(
    () => [
      {
        key: "cardiologist",
        label: t("map.specialty.cardiologist", "Cardiologist"),
      },
      {
        key: "dermatologist",
        label: t("map.specialty.dermatologist", "Dermatologist"),
      },
      {
        key: "pediatrician",
        label: t("map.specialty.pediatrician", "Pediatrician"),
      },
      {
        key: "neurologist",
        label: t("map.specialty.neurologist", "Neurologist"),
      },
      {
        key: "orthopedist",
        label: t("map.specialty.orthopedist", "Orthopedist"),
      },
      {
        key: "psychiatrist",
        label: t("map.specialty.psychiatrist", "Psychiatrist"),
      },
      {
        key: "gynecologist",
        label: t("map.specialty.gynecologist", "Gynecologist"),
      },
      {
        key: "ophthalmologist",
        label: t("map.specialty.ophthalmologist", "Ophthalmologist"),
      },
      { key: "dentist", label: t("map.specialty.dentist", "Dentist") },
      {
        key: "generalPractitioner",
        label: t("map.specialty.generalPractitioner", "General Practitioner"),
      },
      {
        key: "radiologist",
        label: t("map.specialty.radiologist", "Radiologist"),
      },
      {
        key: "anesthesiologist",
        label: t("map.specialty.anesthesiologist", "Anesthesiologist"),
      },
    ],
    [t]
  );

  const otherFilters = useMemo(
    () => [
      { key: "nearMe", label: t("map.filter.nearMe", "Near Me"), role: null },
      { key: "labs", label: t("map.filter.labs", "Labs"), role: "LAB" },
      {
        key: "pharmacy",
        label: t("map.filter.pharmacy", "Pharmacy"),
        role: "PHARMACY",
      },
      {
        key: "hospitals",
        label: t("map.filter.hospitals", "Hospitals"),
        role: "HOSPITAL",
      },
    ],
    [t]
  );

  useEffect(() => {
    localStorage.setItem("selectedFilters", JSON.stringify(selectedFilters));
  }, [selectedFilters]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const doctors = await getAllDoctors();

        const doctorsWithCoords = await Promise.all(
          doctors.map(async (doctor) => {
            if (!doctor.latitude || !doctor.longitude) {
              if (doctor.address) {
                const coords = await geocodeAddress(doctor.address);
                doctor.latitude = coords?.lat || 36.8065;
                doctor.longitude = coords?.lng || 10.1815;
              } else {
                doctor.latitude = 36.8065;
                doctor.longitude = 10.1815;
              }
            }
            return doctor;
          })
        );

        setUsers(doctorsWithCoords);
        setFilteredUsers(doctorsWithCoords);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    // Filter by selected roles
    if (selectedFilters.length > 0) {
      const selectedRoles = otherFilters
        .filter((f) => selectedFilters.includes(f.key) && f.role)
        .map((f) => f.role);

      if (selectedRoles.length > 0)
        filtered = filtered.filter((u) => selectedRoles.includes(u.role));

      // Filter by doctor specialty
      const selectedSpecs = doctorSpecialties
        .filter((s) => selectedFilters.includes(s.key))
        .map((s) => s.label.toLowerCase());
      if (selectedSpecs.length > 0) {
        filtered = filtered.filter(
          (u) =>
            u.role === "DOCTOR" &&
            u.specialty &&
            selectedSpecs.some((spec) =>
              u.specialty.toLowerCase().includes(spec)
            )
        );
      }

      // Near me
      if (selectedFilters.includes("nearMe") && userLocation) {
        filtered = filtered
          .map((u) => ({
            ...u,
            distance:
              u.latitude && u.longitude
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    u.latitude,
                    u.longitude
                  )
                : Infinity,
          }))
          .filter((u) => u.distance <= 10)
          .sort((a, b) => a.distance - b.distance);
      }
    }

    setFilteredUsers(filtered);
  }, [
    selectedFilters,
    searchQuery,
    users,
    userLocation,
    doctorSpecialties,
    otherFilters,
  ]);

  const toggleSelection = (option) =>
    setSelectedFilters((prev) =>
      prev.includes(option)
        ? prev.filter((i) => i !== option)
        : [...prev, option]
    );

  const handleNearMeClick = async () => {
    try {
      const location = await getCurrentLocation(); // browser geolocation
      setUserLocation(location);
      setMapCenter([location.lat, location.lng]);
    } catch (error) {
      console.error("Geolocation error:", error);
      alert(t("map.error.location", "Unable to get your location"));
    }
  };

  const getMarkerIcon = (role) => {
    const roleConfig = ROLE_ICONS[role] || ROLE_ICONS.DOCTOR;
    return createCustomIcon(roleConfig.color, roleConfig.icon);
  };

  const selectedSpecialtyText = useMemo(() => {
    const specs = doctorSpecialties
      .filter((s) => selectedFilters.includes(s.key))
      .map((s) => s.label);
    return specs.length > 0
      ? specs.join(", ")
      : t("map.specialty", "Doctor Specialty");
  }, [selectedFilters, doctorSpecialties, t]);

  return (
    <>
      <Navbar />
      <div className="relative h-screen">
        {/* Search & Filters */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-11/12 sm:w-10/12 md:w-8/12 bg-black/50 backdrop-blur-md border border-[#4addbf50] rounded-3xl z-20 p-6 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_20px_#4addbf50]">
          <input
            type="text"
            placeholder={t(
              "map.search.placeholder",
              "Search doctors, clinics..."
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-black/20 placeholder-white/60 text-white px-4 py-2 rounded-xl border-b-2 border-white/30 focus:outline-none focus:border-[#4addbf] focus:bg-black/50 transition-all duration-300"
          />

          <div className="relative">
            <button
              onClick={() => setFilterDropdown(!filterDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-black/20 border border-white/30 text-white rounded-xl hover:bg-[#1f2937]/50 transition-colors duration-300"
            >
              <span>{selectedSpecialtyText}</span>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${
                  filterDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {filterDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-96 overflow-y-auto bg-black/70 backdrop-blur-md border border-[#4addbf50] rounded-xl shadow-[0_0_20px_#4addbf50] z-50">
                {doctorSpecialties.map((option) => (
                  <button
                    key={option.key}
                    className={`block w-full text-left px-4 py-2 text-white hover:bg-[#4addbf30] transition-all duration-300 ${
                      selectedFilters.includes(option.key)
                        ? "bg-[#4addbf30]"
                        : ""
                    }`}
                    onClick={() => toggleSelection(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {otherFilters.map((option) => (
              <button
                key={option.key}
                onClick={() =>
                  option.key === "nearMe"
                    ? handleNearMeClick()
                    : toggleSelection(option.key)
                }
                className={`px-4 py-2 rounded-xl text-white border-2 ${
                  selectedFilters.includes(option.key)
                    ? "border-[#4addbf] bg-[#4addbf30]"
                    : "border-white/30 hover:border-[#4addbf] hover:bg-[#4addbf20]"
                } transition-all duration-300`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFilterDropdown(false)}
            className="flex items-center justify-center w-12 h-12 bg-[#4addbf] rounded-xl hover:bg-[#39c6a5] text-white transition-all duration-300"
          >
            <FaFilter />
          </button>
        </div>

        {/* Map */}
        <div className="relative z-0 h-screen">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gray-900 text-white">
              <p>{t("map.loading", "Loading map data...")}</p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapUpdater center={mapCenter} />

              {userLocation && (
                <Marker
                  key="current-client"
                  position={[userLocation.lat, userLocation.lng]}
                  icon={
                    new L.Icon({
                      iconUrl:
                        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                    })
                  }
                >
                  <Popup>
                    <strong>{t("map.yourLocation", "Your Location")}</strong>
                  </Popup>
                </Marker>
              )}

              {filteredUsers.map((user) => {
                if (!user.latitude || !user.longitude) return null;
                return (
                  <Marker
                    key={`doctor-${user.id}`} // doctor.id is unique
                    position={[user.latitude, user.longitude]}
                    icon={getMarkerIcon(user.role)}
                  >
                    <Popup>
                      <div className="text-center p-2">
                        <h3 className="font-bold text-lg mb-1">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {t(`map.role.${user.role?.toLowerCase()}`, user.role)}
                        </p>
                        {user.specialty && (
                          <p className="text-sm text-gray-500 mb-2">
                            {user.specialty}
                          </p>
                        )}
                        {user.address && (
                          <p className="text-xs text-gray-500 mb-2">
                            {user.address}
                          </p>
                        )}
                        {user.distance && (
                          <p className="text-xs text-blue-600 mb-2">
                            {user.distance.toFixed(2)} km away
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button className="bg-[#4addbf] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#39c6a5] transition-colors">
                            {t("map.popup.viewProfile", "View Profile")}
                          </button>
                          {user.role === "DOCTOR" && (
                            <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                              {t("map.popup.bookAppointment", "Book")}
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MapPage;
