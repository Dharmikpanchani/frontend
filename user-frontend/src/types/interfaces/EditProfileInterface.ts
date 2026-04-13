export interface AddProfileInterFace {
    email: string,
    phoneNumber: string,
    name: string,
    profile: File | Blob;
    imageUrl?: string;
    address: string;
}
export interface GetProfileInterFace {
    email: string,
    phoneNumber: string,
    name: string,
    profile?: File | Blob;
    image?: string;
    address: string;
}