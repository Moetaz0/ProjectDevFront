import React, { useState } from "react";

const AppointmentForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="relative">
      {/* Appointment Button */}
      <button
        onClick={handleModalToggle}
        className="bg-[#4addbf] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#39c6a5] transition"
      >
        Make Appointment
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
            <form className="space-y-4">
              {/* Doctor/Specialty */}
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Doctor/Specialty
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                >
                  <option value="general">General Practitioner</option>
                  <option value="dentist">Dentist</option>
                  <option value="cardiologist">Cardiologist</option>
                  {/* Add more specialties */}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              </div>

              {/* Patient's Name */}
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Patient's Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Additional details"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleModalToggle}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg mr-4 hover:bg-red-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4addbf] text-white py-2 px-6 rounded-lg hover:bg-[#39c6a5] transition"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentForm;
