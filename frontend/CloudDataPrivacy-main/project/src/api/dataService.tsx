import api from "./axios";
import axios from 'axios';
// Upload manual entry
export const uploadManualEntry = async (entry: any) => {
  return api.post("/store", {
    type: "manual",
    fileName: "PatientsDetails.csv", // fixed file name in S3
    record: entry,
  });
};

// Upload CSV file
export const uploadCSV = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result?.toString().split(",")[1];
        const response = await api.post("/store", {
          type: "file",
          fileName: file.name,
          fileData: base64Data,
        });
        resolve(response.data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const API_BASE = "https://un77q4pfzh.execute-api.ap-south-1.amazonaws.com"; // replace with your Lambda API Gateway URL

export const fetchNoisyData = async (healthIssue: string) => {
  try {
    const response = await axios.get(`${API_BASE}/dev`, {
      params: { healthIssue },
    });
    return response.data; // expected to return CSV content or JSON
  } catch (error) {
    console.error("Error fetching noisy data:", error);
    throw error;
  }
};
