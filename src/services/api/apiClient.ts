
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface ApiOptions {
  token?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export const getAuthToken = (): string | null => {
  const user = localStorage.getItem("user");
  if (user) {
    const parsedUser = JSON.parse(user);
    return parsedUser.token || null;
  }
  return null;
};

export const apiClient = async (
  endpoint: string,
  method: string = "GET",
  data?: any,
  options: ApiOptions = {}
) => {
  // Build URL with query parameters if they exist
  let url = `${API_BASE_URL}${endpoint}`;
  if (options.params && Object.keys(options.params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }
  
  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  // Add authorization token if available
  const token = options.token || getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
  };
  
  // Add body for non-GET requests
  if (method !== "GET" && data) {
    if (data instanceof FormData) {
      // For FormData, remove Content-Type and let browser set it
      delete headers["Content-Type"];
      requestOptions.body = data;
    } else {
      requestOptions.body = JSON.stringify(data);
    }
  }
  
  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      
      if(response.status === 422) {
        
        const errors = await response.json();
        const validationErrors = errors?.errors || {};
        const errorMessages = Object.values(validationErrors)
          .flat()
          .filter((msg) => typeof msg === "string");
        const errorMessage = errorMessages.join("\n");
        toast({
          title: "API Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      const errorData = await response.json().catch(() => ({}));

      const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
      
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    }
    
    // Handle successful response
    // Check if response is empty
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Helper methods for common HTTP methods
export const get = (endpoint: string, options?: ApiOptions) => 
  apiClient(endpoint, "GET", undefined, options);

export const post = (endpoint: string, data?: any, options?: ApiOptions) => 
  apiClient(endpoint, "POST", data, options);

export const put = (endpoint: string, data?: any, options?: ApiOptions) => 
  apiClient(endpoint, "PUT", data, options);

export const del = (endpoint: string, options?: ApiOptions) => 
  apiClient(endpoint, "DELETE", undefined, options);
