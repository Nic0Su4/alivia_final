"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-foreground/90",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group toast group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 dark:group-[.toaster]:bg-green-900/30 dark:group-[.toaster]:text-green-100 group-[.toaster]:border-green-200 dark:group-[.toaster]:border-green-800",
          error:
            "group toast group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 dark:group-[.toaster]:bg-red-900/30 dark:group-[.toaster]:text-red-100 group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
