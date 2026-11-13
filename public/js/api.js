/**
 * Centralized API Client Wrapper
 * Smart Campus Student Management System
 */

function getApiBaseUrl() {
    if (typeof window !== 'undefined') {
        const port = window.location.port;
        const proto = window.location.protocol;
        // If loaded via Live Server (5500), file://, or other port, target the Node backend at 5000
        if (proto === 'file:' || (port !== '5000' && port !== '')) {
            return 'http://localhost:5000/api';
        }
    }
    return '/api';
}

const API = {
    baseURL: getApiBaseUrl(),

    async request(endpoint, options = {}) {
        let cleanEndpoint = endpoint;
        if (cleanEndpoint.startsWith('/api/')) {
            cleanEndpoint = cleanEndpoint.replace('/api/', '/');
        }
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `Request failed with status ${response.status}`);
                }
                return data;
            } else {
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return await response.text();
            }
        } catch (error) {
            console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
            throw error;
        }
    },

    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

window.API = API;
