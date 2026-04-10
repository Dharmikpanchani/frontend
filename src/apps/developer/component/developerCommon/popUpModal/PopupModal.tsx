import { Box, Modal, Typography, Button } from "@mui/material";
import Svg from "@/assets/Svg";
import Spinner from "../spinner/Spinner";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};
interface popUpModalInterface {
  type: string;
  buttonText: string;
  module: string;
  open: boolean;
  buttonStatusSpinner: boolean;
  handleClose: () => void;
  handleFunction: () => void;
}
function PopupModal(props: popUpModalInterface) {
  const {
    type,
    buttonText,
    module,
    open,
    buttonStatusSpinner,
    handleClose,
    handleFunction,
  } = props;
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="admin-modal"
    >
      <Box
        sx={style}
        className="admin-delete-modal-inner-main admin-modal-inner"
      >
        <Box className="modal-body">
          <Box className="admin-modal-hgt-scroll cus-scrollbar">
            {type === "delete" && (
              <Box className="admin-modal-circle-main">
                <img
                  src={Svg.closeCircle}
                  className="admin-user-circle-img"
                  alt="Close"
                />
              </Box>
            )}
            <Typography
              className="admin-delete-modal-title"
              component="h2"
              variant="h2"
            >
              Are you sure?
            </Typography>
            <Typography
              className="admin-delete-modal-para admin-common-para"
              component="p"
            >
              Do you really want to {type} {module}?
            </Typography>
            {type === "delete" && (
              <Typography
                className="admin-delete-modal-para admin-common-para"
                component="p"
              >
                {/* This process cannot be undone. */}
              </Typography>
            )}
          </Box>
          <Box className="admin-delete-modal-btn-flex border-btn-main btn-main">
            <Button
              className="admin-modal-cancel-btn border-btn"
              onClick={handleClose}
              disabled={buttonStatusSpinner}
            >
              Cancel
            </Button>
            <Button
              className={`admin-modal-delete-btn btn ${type === "delete" ? "delete-action" : "status-action"}`}
              onClick={handleFunction}
              disabled={buttonStatusSpinner}
            >
              {buttonStatusSpinner ? <Spinner /> : buttonText}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default PopupModal;
