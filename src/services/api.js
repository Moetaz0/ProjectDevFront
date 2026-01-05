import axios from "axios";
import { getUserFromToken } from "../utils/jwt";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// Fetch all doctors
export const getAllDoctors = async () => {
  try {
    const response = await api.get("/api/doctors");
    console.log("All doctors:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
};
// Fetch doctor by ID
export const getDoctorById = async (id) => {
  try {
    const response = await api.get(`/api/doctors/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    throw error;
  }
};

// Update doctor information
export const updateDoctor = async (id, doctorData) => {
  try {
    const response = await api.put(`/api/doctors/${id}`, doctorData);
    return response.data;
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw error;
  }
};

// Fetch user by ID
export const getUserById = async (id) => {
  try {
    const userId = getUserFromToken()?.userId;
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.post(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const updateLab = async (id, labData) => {
  try {
    const response = await api.put(`/api/labs/${id}`, labData);
    return response.data;
  } catch (error) {
    console.error("Error updating lab:", error);
    throw error;
  }
};

// Fetch doctor appointments
export const getDoctorAppointments = async (doctorId) => {
  try {
    const response = await api.get(`/appointments/doctor/${doctorId}`);
    console.log("Doctor appointments:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

// Fetch client appointments
export const getClientAppointments = async (clientId) => {
  try {
    const response = await api.get(`/appointments/client/${clientId}`);
    console.log("Client appointments:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching client appointments:", error);
    throw error;
  }
};

// Create new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/appointments/book", appointmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

// Fetch patient by ID
export const getPatientById = async (patientId) => {
  try {
    const response = await api.get(`/users/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw error;
  }
};

// Fetch all users (patients)
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Fetch medical history by user ID
export const getMedicalHistoryByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching medical history:", error);
    throw error;
  }
};

// Prescription API functions
export const getDoctorPrescriptions = async (doctorId) => {
  try {
    const response = await api.get(`/api/prescriptions/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error);
    throw error;
  }
};

export const createPrescription = async (prescriptionData) => {
  try {
    const response = await api.post("/api/prescriptions", prescriptionData);
    return response.data;
  } catch (error) {
    console.error("Error creating prescription:", error);
    throw error;
  }
};

export const updatePrescription = async (id, prescriptionData) => {
  try {
    const response = await api.put(
      `/api/prescriptions/${id}`,
      prescriptionData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating prescription:", error);
    throw error;
  }
};

export const deletePrescription = async (id) => {
  try {
    const response = await api.delete(`/api/prescriptions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting prescription:", error);
    throw error;
  }
};

// Lab API functions
export const getAllLabs = async () => {
  try {
    const response = await api.get("/api/labs");
    return response.data;
  } catch (error) {
    console.error("Error fetching labs:", error);
    throw error;
  }
};

export const getLabById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    console.log("Fetched lab:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching lab:", error);
    throw error;
  }
};

export const searchDoctorsByName = async (name) => {
  try {
    const response = await api.get(`/api/doctors/search`, { params: { name } });
    return response.data;
  } catch (error) {
    console.error("Error searching doctors:", error);
    throw error;
  }
};

export const searchLabsByName = async (name) => {
  try {
    const response = await api.get(`/api/labs/search`, { params: { name } });
    return response.data;
  } catch (error) {
    console.error("Error searching labs:", error);
    throw error;
  }
};

export const createLab = async (labData) => {
  try {
    const response = await api.post("/api/labs", labData);
    return response.data;
  } catch (error) {
    console.error("Error creating lab:", error);
    throw error;
  }
};

export const getLabsBySpecialty = async (specialty) => {
  try {
    const response = await api.get(`/api/labs/specialty/${specialty}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching labs by specialty:", error);
    throw error;
  }
};

export const deleteLab = async (id) => {
  try {
    const response = await api.delete(`/api/labs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting lab:", error);
    throw error;
  }
};

// Lab Test API functions
export const getAllTests = async () => {
  try {
    const response = await api.get("/api/labs");
    return response.data;
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw error;
  }
};

export const getTestById = async (id) => {
  try {
    const response = await api.get(`/api/tests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test:", error);
    throw error;
  }
};

export const getTestsByLab = async (labId) => {
  try {
    const response = await api.get(`/api/tests/lab/${labId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tests by lab:", error);
    throw error;
  }
};

export const getTestsByStatus = async (status) => {
  try {
    const response = await api.get(`/api/tests/status/${status}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tests by status:", error);
    throw error;
  }
};

export const createTest = async (testData) => {
  try {
    const response = await api.post("/api/tests", testData);
    return response.data;
  } catch (error) {
    console.error("Error creating test:", error);
    throw error;
  }
};

export const updateTest = async (id, testData) => {
  try {
    const response = await api.put(`/api/tests/${id}`, testData);
    return response.data;
  } catch (error) {
    console.error("Error updating test:", error);
    throw error;
  }
};

export const deleteTest = async (id) => {
  try {
    const response = await api.delete(`/api/tests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting test:", error);
    throw error;
  }
};

// Lab results
export const getLabResultsByLab = async (labId) => {
  try {
    const response = await api.get(`/api/lab-results/lab/${labId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lab results:", error);
    throw error;
  }
};

// Get signed URL for secure file access (stub for backend implementation)
export const getLabResultSignedUrl = async (resultId) => {
  try {
    const response = await api.get(`/api/lab-results/${resultId}/signed-url`);
    return response.data; // Expected: { signedUrl: string, filename: string, expiresAt: string }
  } catch (error) {
    console.error("Error fetching signed URL:", error);
    throw error;
  }
};

export const createLabResultWithFile = async ({
  file,
  testName,
  date,
  clientId,
  doctorId,
  labId,
  medicalHistoryId,
}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("testName", testName);
    if (date) formData.append("date", date);
    formData.append("clientId", clientId);
    formData.append("doctorId", doctorId);
    formData.append("labId", labId);
    if (medicalHistoryId) formData.append("medicalHistoryId", medicalHistoryId);

    const response = await api.post(
      "/api/lab-results/create-with-file",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading lab result:", error);
    throw error;
  }
};

// Notification data normalization
const normalizeNotification = (notif) => {
  if (!notif) return notif;
  return {
    ...notif,
    // Convert isRead (camelCase) or is_read (snake_case) to read (boolean)
    read:
      notif.isRead !== undefined
        ? Boolean(notif.isRead)
        : Boolean(notif.is_read),
  };
};

const normalizeNotifications = (notifications) => {
  if (!Array.isArray(notifications)) return notifications;
  return notifications.map(normalizeNotification);
};

// Notification API functions
export const getUserNotifications = async (userId) => {
  try {
    const response = await api.get(`/api/notifications/user/${userId}`);
    const normalized = normalizeNotifications(response.data);
    return normalized;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const getUnreadNotifications = async (userId) => {
  try {
    const response = await api.get(`/api/notifications/user/${userId}/unread`);
    const normalized = normalizeNotifications(response.data);
    return normalized;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const response = await api.get(
      `/api/notifications/user/${userId}/unread/count`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    const normalized = normalizeNotification(response.data);
    return normalized;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await api.put(
      `/api/notifications/user/${userId}/read-all`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export default api;
