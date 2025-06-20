import axios from 'axios';

const BASE = 'http://localhost:5000';

export const createDisaster = data => axios.post(`${BASE}/disasters`, data);
export const getDisasters = () => axios.get(`${BASE}/disasters`);
export const geocode = desc => axios.post(`${BASE}/disasters/geocode`, { description: desc });
export const getSocialFeed = id => axios.get(`${BASE}/disasters/${id}/social-media`);
export const addImage = (disaster_id, image_url, user_id,content) => axios.post(`${BASE}/disasters/${disaster_id}/reports`, { image_url,user_id,content });
export const verfiyReport = (report_id) => axios.post(`${BASE}/disasters/reports/${report_id}/verify`);
export const getUpdates=()=>axios.get(`${BASE}/disasters/official-updates`)
export const getNearbyResources = (disasterId, lat, lon, radius) =>
  axios.get(`${BASE}/disasters/${disasterId}/resources`, {
    params: {
      lat,
      lon,
      radius,
    },
  });
export const addResource = (disasterId, resourceData) =>axios.post(`${BASE}/disasters/resources/${disasterId}`, resourceData);
export const getReports= ()=> axios.get(`${BASE}/disasters/reports`);
export const loginUser = (username, password) =>axios.post(`${BASE}/login`, { username, password }, { withCredentials: true });
export const deleteDisaster=(id)=>axios.delete(`$BASE/disasters/${id}`)
export const updateDisaster=(id)=>axios.put(`$BASE/disasters/${id}`)