import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
}

const useIsValidToken = (accessToken: string | null): boolean => {

  let valid = false;
  if (accessToken) {
    try {
      const decodedToken: DecodedToken = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp > currentTime) {
        valid = true;
      }
    } catch {
      valid = false;
    }
  }

  // Removed the useEffect that triggers logoutAdmin() because a short-lived access token
  // expiration does not mean the user's entire session is invalid. 
  // The refreshToken logic in apiClient.ts handles the actual session persistence.
  
  return valid;
};

export default useIsValidToken;