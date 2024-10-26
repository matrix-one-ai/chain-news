import { Modal } from "@mui/material";
import Web3AuthLogin from "./Web3AuthLogin";

interface Web3AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Web3AuthModal = ({ isOpen, onClose }: Web3AuthModalProps) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
      }}
    >
      <Web3AuthLogin />
    </Modal>
  );
};

export default Web3AuthModal;
