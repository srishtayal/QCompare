const dotenv=require('dotenv');
const axios= require('axios');

dotenv.config();

async function encodeToUTF8(query) {
  return encodeURIComponent(query);
}

async function fetchLocation(pincode){
  const encodedQuery= await encodeToUTF8(`"${pincode}"`);
  const res= await axios.get(`https://geocode.maps.co/search?q=${encodedQuery}&api_key=${process.env.API}`);
  const latitude= Number(res.data[0]?.lat);
  const longitude=Number(res.data[0]?.lon);
  return {latitude,longitude};
}   

module.exports=fetchLocation