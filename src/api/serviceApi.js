import { getAuthHeaders, handleApiResponse } from './authApi';
import { API_BASE_URL } from './config';

export async function getServices() {
    const response = await fetch(`${API_BASE_URL}/services`);

    if (!response.ok) {
        throw new Error("Failed to fetch services");
    }

    return await response.json();
}

export async function getPackagesByService(serviceId) {
    const response = await fetch(
        `${API_BASE_URL}/services/${serviceId}/packages`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch packages");
    }

    return await response.json();
}

export async function createEnquiry(enquiryData) {
    const response = await fetch(`${API_BASE_URL}/enquiries`, {
        method: "POST",
        headers: getAuthHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify(enquiryData),
    });

    return await handleApiResponse(response, "Failed to submit enquiry");
}

export async function getUserEnquiries() {
    const response = await fetch(`${API_BASE_URL}/enquiries`, {
        headers: getAuthHeaders(),
    });

    return await handleApiResponse(response, "Failed to fetch user enquiries");
}

export async function getAllEnquiries() {
    const response = await fetch(`${API_BASE_URL}/enquiries`, {
        headers: getAuthHeaders(),
    });

    return await handleApiResponse(response, "Failed to fetch enquiries");
}

export async function getEnquiryById(enquiryId) {
    const response = await fetch(`${API_BASE_URL}/enquiries/${enquiryId}`, {
        headers: getAuthHeaders(),
    });

    return await handleApiResponse(response, "Failed to fetch enquiry details");
}

export async function updateEnquiryStatus(enquiryId, status) {
    const response = await fetch(`${API_BASE_URL}/enquiries/${enquiryId}/status`, {
        method: "PUT",
        headers: getAuthHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({ status }),
    });

    return await handleApiResponse(response, "Failed to update enquiry status");
}

export async function createQuotation(quotationData) {
    const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: "POST",
        headers: getAuthHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify(quotationData),
    });

    return await handleApiResponse(response, "Failed to create quotation");
}

export async function getQuotationByEnquiry(enquiryId, userId) {
    const response = await fetch(`${API_BASE_URL}/quotations/enquiry/${enquiryId}`, {
        headers: getAuthHeaders(),
    });

    if (response.status === 404) {
        return null;
    }

    return await handleApiResponse(response, "Failed to fetch quotation");
}

export async function updateQuotationStatus(quotationId, status) {
    const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}/status`, {
        method: "PUT",
        headers: getAuthHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({ status }),
    });

    return await handleApiResponse(response, "Failed to update quotation status");
}

export async function createConsultation(consultationData) {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: "POST",
        headers: getAuthHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify(consultationData),
    });

    return await handleApiResponse(response, "Failed to book consultation");
}

export async function getConsultationByEnquiry(enquiryId) {
    const response = await fetch(`${API_BASE_URL}/consultations/enquiry/${enquiryId}`, {
        headers: getAuthHeaders(),
    });

    if (response.status === 404) {
        return null;
    }

    return await handleApiResponse(response, "Failed to fetch consultation");
}

export async function scheduleConsultation(consultationId, scheduleData) {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/schedule`, {
        method: "PUT",
        headers: getAuthHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify(scheduleData),
    });

    return await handleApiResponse(response, "Failed to schedule consultation");
}
