// Compat layer: maps Semi Design Toast API → sonner
import { toast as sonnerToast } from 'sonner';

const Toast = {
  info: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    return sonnerToast.info(content, { duration, id: opts?.id });
  },
  success: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    return sonnerToast.success(content, { duration, id: opts?.id });
  },
  warning: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    return sonnerToast.warning(content, { duration, id: opts?.id });
  },
  error: (opts) => {
    const content = typeof opts === 'string' ? opts : opts?.content;
    const duration = typeof opts === 'object' ? (opts?.duration || 3) * 1000 : 3000;
    return sonnerToast.error(content, { duration, id: opts?.id });
  },
  close: (id) => {
    sonnerToast.dismiss(id);
  },
};

// Semi Notification compat → sonner with longer duration
const Notification = {
  open: (opts) => {
    const { title, content, duration = 4.5, type = 'info', id } = opts || {};
    const fn = sonnerToast[type] || sonnerToast.info;
    return fn(title || content, {
      description: title ? content : undefined,
      duration: duration === 0 ? Infinity : duration * 1000,
      id: id,
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
