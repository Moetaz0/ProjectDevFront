import React, { useState, useEffect } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../Navbar";
import Footer from "../Footer";

const MapPage = () => {
  const position = [51.505, -0.09];
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(
    JSON.parse(localStorage.getItem("selectedFilters")) || []
  );

  useEffect(() => {
    localStorage.setItem("selectedFilters", JSON.stringify(selectedFilters));
  }, [selectedFilters]);

  const toggleSelection = (option) => {
    setSelectedFilters((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleFilterSelect = (specialty) => {
    toggleSelection(specialty);
  };

  const applyFilter = () => {
    console.log(`Applied Filters: ${selectedFilters}`);
  };

  const doctorSpecialties = ["Cardiologist", "Dermatologist", "Pediatrician"];
  const otherFilters = ["Near Me", "Labs", "Pharmacy"];

  return (
    <>
      <Navbar />
      <div className="relative h-screen">
        {/* Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-11/12 sm:w-10/12 md:w-8/12 bg-black/50 backdrop-blur-md border border-[#4addbf50] rounded-3xl z-20 p-6 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_20px_#4addbf50]">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search doctors, clinics..."
            className="flex-1 bg-black/20 placeholder-white/60 text-white px-4 py-2 rounded-xl border-b-2 border-white/30 focus:outline-none focus:border-[#4addbf] focus:bg-black/50 transition-all duration-300"
          />

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdown(!filterDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-black/20 border border-white/30 text-white rounded-xl hover:bg-[#1f2937]/50 transition-colors duration-300"
            >
              <span>
                {selectedFilters.filter((f) => doctorSpecialties.includes(f))
                  .length > 0
                  ? selectedFilters
                      .filter((f) => doctorSpecialties.includes(f))
                      .join(", ")
                  : "Doctor Specialty"}
              </span>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${
                  filterDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {filterDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-black/70 backdrop-blur-md border border-[#4addbf50] rounded-xl shadow-[0_0_20px_#4addbf50] z-50">
                {doctorSpecialties.map((option) => (
                  <button
                    key={option}
                    className={`block w-full text-left px-4 py-2 text-white hover:bg-[#4addbf30] transition-all duration-300 ${
                      selectedFilters.includes(option) ? "bg-[#4addbf30]" : ""
                    }`}
                    onClick={() => handleFilterSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Other Filters */}
          <div className="flex flex-wrap gap-4">
            {otherFilters.map((option) => (
              <button
                key={option}
                onClick={() => toggleSelection(option)}
                className={`px-4 py-2 rounded-xl text-white border-2 ${
                  selectedFilters.includes(option)
                    ? "border-[#4addbf] bg-[#4addbf30]"
                    : "border-white/30 hover:border-[#4addbf] hover:bg-[#4addbf20]"
                } transition-all duration-300`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Apply Filter Button */}
          <button
            onClick={applyFilter}
            className="flex items-center justify-center w-12 h-12 bg-[#4addbf] rounded-xl hover:bg-[#39c6a5] text-white transition-all duration-300"
          >
            <FaFilter />
          </button>
        </div>

        {/* Map */}
        <div className="relative z-0 h-screen">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker
              position={position}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }
            >
              <Popup>Welcome to Medlink map!</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MapPage;
