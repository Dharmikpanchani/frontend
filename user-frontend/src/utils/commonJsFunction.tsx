import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SubdomainResult {
  isSubdomain: boolean;
  name: string;
}

export function formatCount(countData: number) {
  let count = countData ? countData : 0
  if (count >= 1e9) {
    return (count / 1e9).toFixed(1) + "B";
  } else if (count >= 1e6) {
    return (count / 1e6).toFixed(1) + "M";
  } else if (count >= 1e3) {
    return (count / 1e3).toFixed(1) + "K";
  } else {
    return count.toString(); // Return as string
  }
}


export default function GoToTop({ pageNumber }: { pageNumber: number }) {
  const routePath = useLocation();
  const onTop = () => {
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    onTop();
  }, [routePath, pageNumber]);

  return null;
}


export function shortenString(
  str: string,
  startLength: number = 4,
  endLength: number = 4
): string {
  if (str?.length <= startLength + endLength) {
    return str;
  }
  const start = str?.slice(0, startLength);
  const end = str?.slice(-endLength);
  return `${start}...${end}`;
}

export const getSubdomain = (): SubdomainResult => {
  if (typeof window === "undefined") return { isSubdomain: false, name: "" };
  const host = window.location.hostname;
  const parts = host.split(".");

  // Handling lvh.me for local testing
  if (host.includes("lvh.me")) {
    const subdomain = host.split(".lvh.me")[0];
    if (subdomain && subdomain !== "lvh") {
      return { isSubdomain: true, name: subdomain };
    }
  }

  // Handling localhost
  if (host === "localhost" || host === "127.0.0.1") {
    return { isSubdomain: false, name: "" };
  }

  // If we have more than 2 parts (e.g., school.example.com)
  if (parts.length > 2) {
    return {
      isSubdomain: true,
      name: parts[0],
    };
  }

  return { isSubdomain: false, name: "" };
};
