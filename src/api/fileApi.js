import { getAuthHeaders, handleApiResponse } from './authApi';
import { API_BASE_URL } from './config';

export async function uploadEnquiryFile(enquiryId, file) {
  const formData = new FormData();
  formData.append("enquiryId", enquiryId);
  formData.append("file", file);

  // Note: Do NOT set Content-Type header manually when sending FormData
  const response = await fetch(`${API_BASE_URL}/enquiries/${enquiryId}/files`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return await handleApiResponse(response, "Failed to upload file");
}

export async function getEnquiryFiles(enquiryId) {
  const response = await fetch(`${API_BASE_URL}/enquiries/${enquiryId}/files`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) {
    return [];
  }

  return await handleApiResponse(response, "Failed to fetch enquiry files");
}
