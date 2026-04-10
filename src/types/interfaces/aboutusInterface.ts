export interface GetaboutusUpdate {
    _id: string;
    title: string;
    sub_title: string;
    description: string;
    imageUrl: string | null;
    logoUrl: string | null;
    isActive: boolean;
}

export interface AddaboutusUpdate {
    id: string;
    title: string;
    sub_title: string;
    description: string;
    imageUrl: string | null;
    logoUrl: string | null;
    profile: File | string;
    logo: File | string;
}
