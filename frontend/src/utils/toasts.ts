import { toast } from "react-toastify";

export const displaySuccessMessage = (successMsg: string) =>
  toast.success(successMsg, {
    autoClose: 3000,
    position: "top-center",
    style: {
      background: "#334155",
      borderRadius: "0.5rem",
      color: "#fff",
      border: "0.5px solid",
      borderBottom: "0px",
      borderColor: "#2dd4bf",
    },
  });

export const displayFailureMessage = (errorMsg: string) =>
  toast.error(`Something went wrong. ${errorMsg}`, {
    autoClose: 6000,
    position: "top-center",
    style: {
      background: "#334155",
      borderRadius: "0.5rem",
      color: "#fff",
      border: "0.5px solid",
      borderBottom: "0px",
      borderColor: "#e74c3c",
    },
  });

export const displayWarningMessage = (warningMsg: string) =>
  toast.warn(warningMsg, {
    autoClose: 6000,
    position: "top-center",
    style: {
      background: "#334155",
      borderRadius: "0.5rem",
      color: "#fff",
      border: "0.5px solid",
      borderBottom: "0px",
      borderColor: "#f1c40f",
    },
  });
