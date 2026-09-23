export const LOCAL_STORAGE_KEY = 'zenque_enquiries';

export const MOCK_FALLBACK_ENQUIRIES = [
  {
    enquiryId: 'ZT-10234',
    id: 'ZT-10234',
    service: 'Web Development',
    serviceTitle: 'Web Development',
    package: 'Standard Package',
    packageTier: 'Standard Package',
    submittedDate: '12 Sep 2026',
    createdAt: '2026-09-12T10:00:00.000Z',
    status: 'quotation_sent',
    projectName: 'Corporate Portal & Admin Dashboard',
    projectDescription: 'High-performance web application with custom authentication, responsive frontend, and database backend.',
    requiredFeatures: 'User Login, Admin Analytics Panel, Third-Party API Sync',
    additionalRequirements: 'ISO security compliance, zero-downtime deployment',
    budget: '₹50K – ₹1L',
    timeline: '2–4 Weeks',
    clientName: 'Alex Morgan',
    fullName: 'Alex Morgan',
    companyName: 'ABC Technologies',
    email: 'alex@abctechnologies.com',
    phone: '+91 98765 43210',
    uploadedFiles: [{ name: 'project_brief_draft.pdf', size: '1.2 MB' }],
    files: [{ name: 'project_brief_draft.pdf', size: '1.2 MB' }],
    consultation: 'yes',
    requestCall: 'yes',
    needsConsultation: 'yes',
    preferredDate: '',
    preferredTime: '',
    quotation: {
      id: 'QT-10234',
      issuedDate: '12 Sep 2026',
      validUntil: '30 Sep 2026',
      totalAmount: '₹77,000',
      architectNotes: 'Includes full source code ownership, Docker containerization scripts, and 4 weeks of SLA technical support.',
      breakdown: [
        { desc: 'Standard Web Application Scope & Frontend Architecture', cost: '₹65,000' },
        { desc: 'Database Schema Setup & REST API Integration', cost: '₹12,000' }
      ]
    }
  },
  {
    enquiryId: 'ZT-10235',
    id: 'ZT-10235',
    service: 'UI/UX Design',
    serviceTitle: 'UI/UX Design',
    package: 'Basic Package',
    packageTier: 'Basic Package',
    submittedDate: '10 Sep 2026',
    createdAt: '2026-09-10T14:30:00.000Z',
    status: 'quotation_sent',
    projectName: 'Mobile App Wireframes',
    projectDescription: 'Figma wireframes and design system for cross-platform app.',
    requiredFeatures: 'Interactive Figma Prototype, Color Palette',
    additionalRequirements: 'Developer handoff documentation',
    budget: '₹25K – ₹50K',
    timeline: 'Less than 2 Weeks',
    clientName: 'Sarah Jenkins',
    fullName: 'Sarah Jenkins',
    companyName: 'Apex Solutions',
    email: 'sarah@apexsolutions.com',
    phone: '+91 98123 45678',
    uploadedFiles: [],
    files: [],
    consultation: 'no',
    requestCall: 'no',
    needsConsultation: 'no',
    preferredDate: '',
    preferredTime: '',
    quotation: {
      id: 'QT-10235',
      issuedDate: '11 Sep 2026',
      validUntil: '25 Sep 2026',
      totalAmount: '₹35,000',
      architectNotes: 'Complete Figma design system with exported asset library.',
      breakdown: [
        { desc: 'Basic UI/UX Design Kit & Wireframes', cost: '₹30,000' },
        { desc: 'Clickable Mobile Prototype & Exported Assets', cost: '₹5,000' }
      ]
    }
  }
];

// Load enquiries from localStorage, initializing with fallback mock data if empty
export function getStoredEnquiries() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse zenque_enquiries from localStorage:', e);
  }
  saveStoredEnquiries(MOCK_FALLBACK_ENQUIRIES);
  return MOCK_FALLBACK_ENQUIRIES;
}

// Save enquiries array to localStorage and notify app
export function saveStoredEnquiries(enquiries) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enquiries));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zenque_enquiries_updated', { detail: enquiries }));
    }
  } catch (e) {
    console.error('Failed to save zenque_enquiries to localStorage:', e);
  }
}

// Generate unique Enquiry ID (e.g., ZT-10236)
export function generateNextEnquiryId() {
  const existing = getStoredEnquiries();
  let maxIdNum = 10233;
  existing.forEach(item => {
    const idStr = item.enquiryId || item.id || '';
    const match = idStr.match(/^ZT-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) {
        maxIdNum = num;
      }
    }
  });
  return `ZT-${maxIdNum + 1}`;
}

// Append a new enquiry to existing enquiries array in localStorage
export function saveNewEnquiry(enquiryData) {
  const existing = getStoredEnquiries();
  const targetId = enquiryData.enquiryId || enquiryData.id;
  const filtered = existing.filter(item => (item.enquiryId || item.id) !== targetId);
  const updated = [enquiryData, ...filtered];
  saveStoredEnquiries(updated);
  return updated;
}

// Update an enquiry object in localStorage
export function updateStoredEnquiry(updatedEnquiry) {
  const existing = getStoredEnquiries();
  const targetId = updatedEnquiry.enquiryId || updatedEnquiry.id;
  const updated = existing.map(item => {
    if ((item.enquiryId || item.id) === targetId) {
      return { ...item, ...updatedEnquiry };
    }
    return item;
  });
  saveStoredEnquiries(updated);
  return updated;
}

export function formatConsultationSchedule(dateStr, timeStr) {
  if (!dateStr && !timeStr) return '';

  let formattedDate = dateStr || '';
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  let formattedTime = timeStr || '';
  if (timeStr && /^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    const min = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    formattedTime = `${h}:${min} ${ampm}`;
  }

  if (formattedDate && formattedTime) {
    return `${formattedDate}, ${formattedTime}`;
  }
  return formattedDate || formattedTime;
}

