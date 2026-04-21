import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import {
  Box,
  Button,
  FormHelperText,
  Typography,
  Grid,
  OutlinedInput,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  CameraAlt as CameraAltIcon,
  PhoneAndroid as PhoneIcon,
  Description as LegalIcon
} from "@mui/icons-material";
import type {
  AddProfileInterFace,
  GetProfileInterFace,
} from "@/types/interfaces/EditProfileInterface";
import { authService } from "@/api/services/auth.service";
import { setAdminLogin } from "@/redux/slices/authSlice";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { toasterError, toasterSuccess } from "@/utils/toaster/Toaster";
import { profileValidationSchema } from "@/utils/validation/FormikValidation";
import Png from "@/assets/Png";
import Spinner from "../../component/developerCommon/spinner/Spinner";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE;

export default function EditProfile() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.AdminReducer);
  const [buttonSpinner, setButtonSpinner] = useState(false);

  const [selectedData, setSelectedData] = useState<GetProfileInterFace>({
    email: "",
    phoneNumber: "",
    name: "",
    profile: "" as any,
    image: "",
    address: "",
  });

  const initialValues: AddProfileInterFace = {
    email: selectedData?.email ? selectedData?.email : "",
    address: selectedData?.address ? selectedData?.address : "",
    phoneNumber: selectedData?.phoneNumber
      ? selectedData?.phoneNumber
      : "",
    name: selectedData?.name ? selectedData?.name : "",
    profile: "" as any,
    imageUrl: selectedData?.image
      ? `${imageBaseUrl}/${selectedData?.image}`
      : "",
  };

  const handleGetData = async () => {
    try {
      const res: any = await authService.getProfile();
      if (res.status === 200) {
        setSelectedData(res.data);
        dispatch(setAdminLogin(res.data));
      } else {
        toasterError(res?.message || "Failed to fetch profile");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Error fetching profile";
      toasterError(errorMessage);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  const handleSubmit = async (values: AddProfileInterFace) => {
    const formData = new FormData();
    if (values?.profile) {
      formData.append("imageUrl", values?.profile);
    }
    formData.append("email", values?.email.toLowerCase());
    formData.append("name", values?.name);
    formData.append("phoneNumber", values?.phoneNumber);
    formData.append("address", values?.address);

    setButtonSpinner(true);
    try {
      const res: any = await authService.updateProfile(formData);
      setButtonSpinner(false);
      if (res.status === 200 || res.status === 201) {
        toasterSuccess(res?.message || "Profile updated successfully");
        handleGetData();
      } else {
        toasterError(res?.message || "Failed to update profile");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Error updating profile";
      toasterError(errorMessage);
      setButtonSpinner(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={profileValidationSchema}
    >
      {(formikProps: FormikProps<AddProfileInterFace>) => {
        const {
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: formikSubmit,
          setFieldValue,
          setFieldTouched,
          setFieldError,
          resetForm,
          isSubmitting,
        } = formikProps;


        return (
          <Form onSubmit={formikSubmit}>
            {loading ? (
              <CommonLoader />
            ) : (
              <>
                <Box className="admin-edit-profile-main common-card profile-main">
                  <Box
                    className="profile-header-main"
                    sx={{
                      display: 'flex',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 2, sm: 4 },
                      mb: { xs: 3, sm: 6 },
                      pb: { xs: 3, sm: 4 },
                      borderBottom: '1px solid #F0F0F0'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#F0F2F5',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      >
                        <img
                          src={
                            values?.imageUrl
                              ? values.imageUrl
                              : values?.profile && typeof values.profile === 'string'
                                ? values.profile
                                : Png.dummyUser
                          }
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Button
                        variant="contained"
                        component="label"
                        disabled={isSubmitting || buttonSpinner}
                        sx={{
                          position: 'absolute',
                          bottom: 5,
                          right: 5,
                          minWidth: 34,
                          width: 34,
                          height: 34,
                          backgroundColor: 'var(--primary-color)',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          border: '3px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          p: 0,
                          '&:hover': {
                            backgroundColor: 'var(--primary-color)',
                            opacity: 0.8
                          }
                        }}
                      >
                        <CameraAltIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={async (e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) {
                              setFieldValue("profile", file);
                              setFieldValue("imageUrl", URL.createObjectURL(file));
                              setFieldTouched("profile", true);
                              setFieldError("profile", undefined);
                              await formikProps.validateField("profile");
                            }
                          }}
                        />
                      </Button>
                      {(errors.profile && touched.profile) && (
                        <FormHelperText error sx={{ position: 'absolute', bottom: -25, width: 'max-content', left: '75%', transform: 'translateX(-50%)', fontSize: '11px' }}>
                          {errors.profile as string}
                        </FormHelperText>
                      )}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: '22px',
                          fontWeight: 700,
                          color: '#344054',
                          lineHeight: 1.2,
                          mb: 0.5,
                          fontFamily: "'PlusJakartaSans-Bold', sans-serif"
                        }}
                      >
                        {values?.name || "User Name"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '15px',
                          color: '#667085',
                          mb: 1.5,
                          fontFamily: "'PlusJakartaSans-Medium', sans-serif"
                        }}
                      >
                        {values?.email || "user@example.com"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: '#98A2B3',
                          fontStyle: 'italic',
                          fontFamily: "'PlusJakartaSans-Regular', sans-serif"
                        }}
                      >
                        Click the camera icon to update your photo
                      </Typography>
                    </Box>
                  </Box>

                  <Box component="div" sx={{ maxWidth: '100%', mx: '0 auto' }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box className="admin-input-box" sx={{ mb: 1 }}>
                          <Typography sx={labelSx}>
                            <PersonIcon sx={{ fontSize: 14, color: 'var(--primary-color)' }} />
                            Full Name <span className="astrick-sing">*</span>
                          </Typography>
                          <Box className="admin-form-group">
                            <OutlinedInput
                              fullWidth
                              name="name"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Enter full name"
                              value={values.name}
                              error={errors?.name && touched?.name ? true : false}
                              sx={inputSx}
                            />
                            <FormHelperText className="error-text">
                              {errors?.name && touched?.name ? errors.name : null}
                            </FormHelperText>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box className="admin-input-box" sx={{ mb: 1 }}>
                          <Typography sx={labelSx}>
                            <EmailIcon sx={{ fontSize: 14, color: 'var(--primary-color)' }} />
                            Email <span className="astrick-sing">*</span>
                          </Typography>
                          <Box className="admin-form-group">
                            <OutlinedInput
                              fullWidth
                              disabled
                              name="email"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Enter email address"
                              value={values.email}
                              error={errors?.email && touched?.email ? true : false}
                              sx={{
                                ...inputSx,
                                '&.MuiOutlinedInput-root': {
                                  ...(inputSx as any)['&.MuiOutlinedInput-root'],
                                  backgroundColor: '#F3F4F6',
                                }
                              }}
                            />
                            <FormHelperText className="error-text">
                              {errors?.email && touched?.email ? errors.email : null}
                            </FormHelperText>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box className="admin-input-box" sx={{ mb: 1 }}>
                          <Typography sx={labelSx}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'var(--primary-color)' }} />
                            Phone Number
                          </Typography>
                          <Box className="admin-form-group">
                            <OutlinedInput
                              fullWidth
                              name="phoneNumber"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Enter phone number"
                              value={values.phoneNumber}
                              sx={inputSx}
                            />
                          </Box>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box className="admin-input-box" sx={{ mb: 1 }}>
                          <Typography sx={labelSx}>
                            <LegalIcon sx={{ fontSize: 14, color: 'var(--primary-color)' }} />
                            Address
                          </Typography>
                          <Box className="admin-form-group">
                            <OutlinedInput
                              fullWidth
                              name="address"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Enter address"
                              value={values.address}
                              sx={inputSx}
                            />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    disabled={isSubmitting || buttonSpinner}
                    onClick={() => resetForm()}
                    sx={{
                      minWidth: { xs: '100%', sm: '130px' },
                      height: '40px',
                      borderRadius: '8px',
                      color: '#667085',
                      borderColor: '#D0D5DD',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#F9FAFB',
                        borderColor: '#D0D5DD',
                      },
                    }}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || buttonSpinner}
                    className="admin-btn-theme"
                    sx={{
                      minWidth: { xs: '100%', sm: '150px' },
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-color) !important',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: 'var(--primary-color)',
                        opacity: 0.8,
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isSubmitting || buttonSpinner ? (
                      <Spinner />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <SaveIcon sx={{ fontSize: 18 }} />
                        Save Changes
                      </Box>
                    )}
                  </Button>
                </Box>
              </>
            )}
          </Form>
        );
      }}
    </Formik>
  );
}
