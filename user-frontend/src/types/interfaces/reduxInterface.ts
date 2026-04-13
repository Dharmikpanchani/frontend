export interface AdminState {
  isAdminLogin: boolean;
  adminDetails: any;
  token: string;
}

export interface RootState {
  AdminReducer: AdminState;
}

export interface AdminPayload {
  // Define the properties of AdminPayload here
  username: string;
  token: string;
  // Add other properties as needed
}
