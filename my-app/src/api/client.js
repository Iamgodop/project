const API_BASE_URL = 'http://localhost:2007';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  auth: {
    organizationLogin: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/Organization/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    sponsorLogin: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/Sponsor/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    organizationRegister: async (email, password, username) => {
      const response = await fetch(`${API_BASE_URL}/Organization/Register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      return handleResponse(response);
    },

    sponsorRegister: async (email, password, username) => {
      const response = await fetch(`${API_BASE_URL}/Sponsor/Register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      return handleResponse(response);
    },
  },

  profile: {
    getOrganizationDetails: async () => {
      const response = await fetch(`${API_BASE_URL}/getDetails/Organization`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    getSponsorDetails: async () => {
      const response = await fetch(`${API_BASE_URL}/getDetails/Sponsor`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    updateSponsorProfile: async (data) => {
      const response = await fetch(`${API_BASE_URL}/Update/Sponsor/Profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    updateOrganizationProfile: async (data) => {
      const response = await fetch(`${API_BASE_URL}/Update/Organization/Profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    updateSponsorCompany: async (data) => {
      const response = await fetch(`${API_BASE_URL}/Update/Sponsor/Company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    updateOrganizationPassword: async (currentPassword, newPassword) => {
      const response = await fetch(`${API_BASE_URL}/Update/Password/Organization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return handleResponse(response);
    },

    updateSponsorPassword: async (currentPassword, newPassword) => {
      const response = await fetch(`${API_BASE_URL}/Update/Password/Sponsor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return handleResponse(response);
    },
  },

  events: {
    createEvent: async (data) => {
      const response = await fetch(`${API_BASE_URL}/Event/Create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getEventDetails: async (id) => {
      const response = await fetch(`${API_BASE_URL}/Event/GetDetails/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    getMyEvents: async () => {
      const response = await fetch(`${API_BASE_URL}/Event/GetEvents`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    getAllEvents: async () => {
      const response = await fetch(`${API_BASE_URL}/Event/getAllEvents`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },
};

export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};
