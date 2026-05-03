export interface AddProfileInterFace {
    email: string,
    phoneNumber: string,
    name: string,
    profile: File | Blob;
    imageUrl?: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude?: string;
    longitude?: string;
    UPIId?: string;
}
export interface GetProfileInterFace {
    email: string,
    phoneNumber: string,
    name: string,
    profile?: File | Blob;
    image?: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude?: string;
    longitude?: string;
    UPIId?: string;
}