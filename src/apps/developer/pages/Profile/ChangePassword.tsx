import { useState } from "react";
import { useDispatch } from "react-redux";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import {
  Box,
  Button,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockOutlinedIcon,
  KeyOutlined as KeyOutlinedIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import type { ChangePasswordInterface } from "@/types/interfaces/LoginInterface";
import { authService } from "@/api/services/auth.service";
import { logoutAdmin } from "@/redux/slices/authSlice";
import { toasterError, toasterSuccess } from "@/utils/toaster/Toaster";
import { changePasswordValidationSchema } from "@/utils/validation/FormikValidation";
import Spinner from "../../component/developerCommon/spinner/Spinner";

export default function ChangePassword() {
  const dispatch = useDispatch();
  const [oldPasswordVisible, setOldPasswordVisible] = useState<boolean>(true);
  const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(true);

  const toggleOldPassword = () => setOldPasswordVisible(!oldPasswordVisible);
  const toggleNewPassword = () => setNewPasswordVisible(!newPasswordVisible);
  const toggleConfirmPassword = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const initialValues: ChangePasswordInterface = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: ChangePasswordInterface, { resetForm }: { resetForm: () => void }) => {
    try {
      const res: any = await authService.changePassword(values);
      if (res.status === 201 || res.status === 200) {
        toasterSuccess(res?.message || "Password changed successfully");
        resetForm();
        dispatch(logoutAdmin());
      } else {
        toasterError(res?.message || "Failed to change password");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Error changing password";
      toasterError(errorMessage);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={changePasswordValidationSchema}
      onSubmit={handleSubmit}
    >
      {(formikProps: FormikProps<ChangePasswordInterface>) => {
        const { values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, resetForm, isSubmitting } =
          formikProps;

        const labelSx = {
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          fontSize: '13px',
          fontWeight: 500,
          color: '#344054', // Gray-700
          mb: 1,
          fontFamily: "'Poppins', sans-serif"
        };

        const inputSx = {
          height: '40px',
          maxWidth: '460px',
          '&.MuiOutlinedInput-root': {
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '6px',
            '& fieldset': {
              borderColor: '#E4E7EC',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: '#ced4da',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff8c00',
              borderWidth: '1.5px',
            },
          },
          '& .MuiOutlinedInput-input': {
            height: '40px',
            padding: '0 14px',
            fontSize: '14px',
            color: '#1D2939',
            fontFamily: "'Poppins', sans-serif"
          },
        };

        return (
          <Form onSubmit={formikSubmit}>
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
              <Box
                sx={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: "12px",
                  p: 3,
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  border: '1px solid #E5E7EB'
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <LockOutlinedIcon sx={{ color: '#942F15', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#344054",
                      fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                      marginBottom: '4px'
                    }}
                  >
                    Update your password
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#667085",
                      fontFamily: "'PlusJakartaSans-Medium', sans-serif"
                    }}
                  >
                    Ensure your account is using a strong password for security
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Box className="admin-input-box" sx={{ mb: 1 }}>
                    <Typography sx={labelSx}>
                      <LockOutlinedIcon sx={{ fontSize: 14, color: '#942F15' }} />
                      Current Password <span className="astrick-sing">*</span>
                    </Typography>
                    <Box className="admin-form-group">
                      <OutlinedInput
                        fullWidth
                        type={oldPasswordVisible ? "password" : "text"}
                        name="oldPassword"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter current password"
                        value={values.oldPassword}
                        error={errors?.oldPassword && touched?.oldPassword ? true : false}
                        sx={inputSx}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton onClick={toggleOldPassword} edge="end">
                              {oldPasswordVisible ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <FormHelperText className="error-text">
                        {errors?.oldPassword && touched?.oldPassword && typeof errors.oldPassword === 'string' ? errors.oldPassword : null}
                      </FormHelperText>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box className="admin-input-box" sx={{ mb: 1 }}>
                    <Typography sx={labelSx}>
                      <KeyOutlinedIcon sx={{ fontSize: 14, color: '#942F15' }} />
                      New Password <span className="astrick-sing">*</span>
                    </Typography>
                    <Box className="admin-form-group">
                      <OutlinedInput
                        fullWidth
                        type={newPasswordVisible ? "password" : "text"}
                        name="newPassword"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter new password"
                        value={values.newPassword}
                        error={errors?.newPassword && touched?.newPassword ? true : false}
                        sx={inputSx}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton onClick={toggleNewPassword} edge="end">
                              {newPasswordVisible ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <FormHelperText className="error-text">
                        {errors?.newPassword && touched?.newPassword && typeof errors.newPassword === 'string' ? errors.newPassword : null}
                      </FormHelperText>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box className="admin-input-box" sx={{ mb: 1 }}>
                    <Typography sx={labelSx}>
                      <CheckCircleOutlinedIcon sx={{ fontSize: 14, color: '#942F15' }} />
                      Confirm New Password <span className="astrick-sing">*</span>
                    </Typography>
                    <Box className="admin-form-group">
                      <OutlinedInput
                        fullWidth
                        type={confirmPasswordVisible ? "password" : "text"}
                        name="confirmPassword"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Confirm new password"
                        value={values.confirmPassword}
                        error={errors?.confirmPassword && touched?.confirmPassword ? true : false}
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        sx={inputSx}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton onClick={toggleConfirmPassword} edge="end">
                              {confirmPasswordVisible ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <FormHelperText className="error-text">
                        {errors?.confirmPassword && touched?.confirmPassword && typeof errors.confirmPassword === 'string' ? errors.confirmPassword : null}
                      </FormHelperText>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  disabled={isSubmitting}
                  onClick={() => resetForm()}
                  sx={{
                    minWidth: '130px',
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
                  disabled={isSubmitting}
                  className="admin-btn-theme"
                  sx={{
                    minWidth: '150px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#942F15 !important',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#7A2711',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SaveIcon sx={{ fontSize: 18 }} />
                      Update Password
                    </Box>
                  )}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
