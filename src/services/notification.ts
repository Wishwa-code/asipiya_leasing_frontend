import { toast } from "sonner";
import React from "react";

export type ToastId = string | number;

export interface ToastAction {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export interface ToastOptions {
  id?: ToastId;
  duration?: number;
  description?: React.ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  onDismiss?: (toast: any) => void;
  onAutoClose?: (toast: any) => void;
}

export interface PromiseToastOptions<T> {
  loading: string | React.ReactNode;
  success: string | React.ReactNode | ((data: T) => string | React.ReactNode);
  error: string | React.ReactNode | ((error: any) => string | React.ReactNode);
  description?: React.ReactNode | ((data: any) => React.ReactNode);
  duration?: number;
  onDismiss?: (toast: any) => void;
  onAutoClose?: (toast: any) => void;
}

/**
 * A decoupled notification service that wraps sonner's toast functionality.
 * This adheres to best software practices by separating the third-party toast
 * library implementation from caller components in our app.
 */
export const notification = {
  /**
   * Display a standard info notification.
   */
  info: (message: string | React.ReactNode, options?: ToastOptions): ToastId => {
    return toast.info(message, {
      id: options?.id,
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Display a success notification.
   */
  success: (message: string | React.ReactNode, options?: ToastOptions): ToastId => {
    return toast.success(message, {
      id: options?.id,
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Display a warning/caution notification.
   */
  warning: (message: string | React.ReactNode, options?: ToastOptions): ToastId => {
    return toast.warning(message, {
      id: options?.id,
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Display an error/alert notification.
   */
  error: (message: string | React.ReactNode, options?: ToastOptions): ToastId => {
    return toast.error(message, {
      id: options?.id,
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Display a custom notification with raw content.
   */
  custom: (message: string | React.ReactNode, options?: ToastOptions): ToastId => {
    return toast(message, {
      id: options?.id,
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Display a loading spinner toast. Useful for background task tracking.
   */
  loading: (message: string | React.ReactNode, options?: ToastOptions): ToastId => {
    return toast.loading(message, {
      id: options?.id,
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Handle promises with loading, success, and error states automatically.
   */
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: PromiseToastOptions<T>
  ): any => {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      duration: options.duration,
      onDismiss: options.onDismiss,
      onAutoClose: options.onAutoClose,
    });
  },

  /**
   * Dismiss/remove a specific toast notification by its ID. If no ID is passed, dismisses all.
   */
  dismiss: (id?: ToastId): void => {
    if (id !== undefined) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  },
};
