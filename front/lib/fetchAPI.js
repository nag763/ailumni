
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
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong');
    }

    return result;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

export default fetchAPI;
