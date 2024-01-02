export interface ToastProps {
  summary?: string
  detail?: string
}

const { $toast } = useNuxtApp();

function getProps(summary?: string, detail?: string) {
  return {
    summary: summary ?? '',
    detail: detail ?? '',
    life: 2000,
  };
}

export function toastSuccess({ summary, detail }: ToastProps) {
  const options = getProps(summary ?? '', detail ?? '');

  $toast.add({
    severity: 'success',
    ...options,
  });
};

export function toastError({ summary, detail }: ToastProps) {
  const options = getProps(summary ?? '', detail ?? '');

  $toast.add({
    severity: 'error',
    ...options,
  });
};

export function toastInfo({ summary, detail }: ToastProps) {
  const options = getProps(summary ?? '', detail ?? '');

  $toast.add({
    severity: 'info',
    ...options,
  });
};

export function toastWarning({ summary, detail }: ToastProps) {
  const options = getProps(summary ?? '', detail ?? '');

  $toast.add({
    severity: 'warn',
    ...options,
  });
};
