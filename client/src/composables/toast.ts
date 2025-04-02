import { useToast } from "vue-toastification";
const toast = useToast();

export const useGlobalToast = () => ({
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast.info(msg),
});
