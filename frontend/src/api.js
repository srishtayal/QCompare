import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export const fetchComparison = async (query, pincode) => {
    const res = await axios.post(`${BASE_URL}/search/compare`, { query, pincode });
    return res.data;
} 