const badgeVariants = {
  warning: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  destructive: "bg-red-100 text-red-800",
  secondary: "bg-gray-100 text-gray-800",
};

export const Badge = ({
  variant = "secondary",
  children,
}: {
  variant?: keyof typeof badgeVariants;
  children: React.ReactNode;
}) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeVariants[variant]}`}
    >
      {children}
    </span>
  );
};
