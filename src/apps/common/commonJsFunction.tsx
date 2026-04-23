import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SubdomainResult {
  isSubdomain: boolean;
  name: string;
}

export function formatCount(countData: number) {
  let count = countData ? countData : 0;
  if (count >= 1e9) {
    return (count / 1e9).toFixed(1) + "B";
  } else if (count >= 1e6) {
    return (count / 1e6).toFixed(1) + "M";
  } else if (count >= 1e3) {
    return (count / 1e3).toFixed(1) + "K";
  } else {
    return count.toString();
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

const { VITE_END_WITH_DOMAIN } = import.meta.env;

export const getSubdomain = (): SubdomainResult => {
  const host = window.location.hostname;
  
  if (!VITE_END_WITH_DOMAIN) return { isSubdomain: false, name: "" };

  const baseDomainWithDot = VITE_END_WITH_DOMAIN.startsWith(".") ? VITE_END_WITH_DOMAIN : `.${VITE_END_WITH_DOMAIN}`;
  const apexDomain = baseDomainWithDot.substring(1);

  if (host === "localhost" || host === "127.0.0.1" || host === apexDomain) {
    return { isSubdomain: false, name: "" };
  }

  if (host.endsWith(baseDomainWithDot)) {
    const subdomain = host.replace(baseDomainWithDot, "");
    if (subdomain && subdomain !== "") {
      return { isSubdomain: true, name: subdomain };
    }
  }

  return { isSubdomain: false, name: "" };
};

export const getCookieDomain = () => {
  const host = window.location.hostname;
  if (!VITE_END_WITH_DOMAIN) return undefined;

  const baseDomainWithDot = VITE_END_WITH_DOMAIN.startsWith(".") ? VITE_END_WITH_DOMAIN : `.${VITE_END_WITH_DOMAIN}`;
  const apexDomain = baseDomainWithDot.substring(1);

  if (host === "localhost" || host === "127.0.0.1" || host === apexDomain) {
    return undefined;
  }
  
  return VITE_END_WITH_DOMAIN;
};
