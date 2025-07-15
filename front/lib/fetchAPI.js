
import { toast } from 'react-toastify';

const fetchAPI = async (method, endpoint, data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + endpoint, config);
    if(response.status === 204) return Promise.resolve(null);
    const result = await response.json();

    if (!response.ok) {
      const errorData = {
        status: response.status,
        message: result.error || result.message || result.detail || 'An error occurred.',
      };
      throw errorData;
    }

    return result;
  } catch (error) {
    if (error.status) {
      switch (error.status) {
        case 400:
          toast.error(error.message);
          break;
        case 401:
        case 403:
          toast.error('Please log in again.');
          break;
        case 500:
          toast.error('An unexpected error occurred. Please try again later.');
          break;
        default:
          toast.error(error.message);
      }
    } else {
      toast.error('An unexpected error occurred.');
    }

    console.error("Fetch API error", error);
    throw error;
  }
};

export default fetchAPI;
