import { MetadataRoute } from "next";
import { schoolService } from "@/api/services/school.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let schoolRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const response = await schoolService.getAllSchoolCodes();
    const schoolCodes = response?.data || [];
    
    schoolRoutes = schoolCodes.map((code: string) => ({
      url: `https://${code}.schoolmanagement.com`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to fetch school codes for sitemap:", error);
  }

  return [
    {
      url: "https://schoolmanagement.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...schoolRoutes
  ];
}
