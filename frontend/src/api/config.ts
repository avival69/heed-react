import { Platform } from "react-native";

// 1. Backend URL
export const API_URL = "http://192.168.1.3:5000/api"; 
// Note: If testing on Android Emulator, you might need: "http://10.0.2.2:5000/api"

// 2. Cloudflare Public URL
export const R2_BASE_URL = "https://pub-52a7337cc0c34226bcd23333580143ba.r2.dev";

// 3. Helper to format URLs
export const getImageUrl = (url?: string) => {
  if (!url) return undefined; // Return undefined so Image component handles fallback
  
  // If it's already a full http link
  if (url.startsWith("http")) {
    // If it's the internal R2 link, swap it for the public one
    if (url.includes("r2.cloudflarestorage.com")) {
      const filename = url.split("/").pop();
      return `${R2_BASE_URL}/${filename}`;
    }
    return url;
  }
  
  // If it's just a filename, append base
  return `${R2_BASE_URL}/${url}`;
};