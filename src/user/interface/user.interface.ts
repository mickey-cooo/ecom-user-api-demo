export interface UserRequestBodyResponse {
  nameTh: string;
  lastNameTh: string;
  nameEn: string;
  lastNameEn: string;
  email: string;
  phoneNumber: string;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export interface UserRequestParamsResponse {
  id: string;
}
