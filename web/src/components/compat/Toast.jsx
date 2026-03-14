// Compat layer: maps Semi Design Toast API → sonner
import { toast as sonnerToast } from 'sonner';

const Toast = {
  info: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    sonnerToast.info(content, { duration });
  },
  success: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    sonnerToast.success(content, { duration });
  },
  warning: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    sonnerToast.warning(content, { duration });
  },
  error: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    sonnerToast.error(content, { duration });
  },
  close: (id) => {
    sonnerToast.dismiss(id);
  },
};

// Semi Notification compat → sonner with longer duration
const Notification = {
  open: (opts) => {
    const { title, content, duration = 4.5, type = 'info' } = opts || {};
    const fn = sonnerToast[type] || sonnerToast.info;
    fn(title || content, {
      description: title ? content : undefined,
      duration: duration * 1000,
    });
  },
  info: (opts) => Notification.open({ ...opts, type: 'info' }),
  success: (opts) => Notification.open({ ...opts, type: 'success' }),
  warning: (opts) => Notification.open({ ...opts, type: 'warning' }),
  error: (opts) => Notification.open({ ...opts, type: 'error' }),
  close: (id) => sonnerToast.dismiss(id),
};

export { Toast, Notification };
export default Toast;
