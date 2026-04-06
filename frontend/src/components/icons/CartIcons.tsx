import { FaShoppingCart } from "react-icons/fa";

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

interface CartIconProps {
  size?: keyof typeof sizeMap;
  color?: string; // Tailwind text color class (e.g. "text-red-500")
  className?: string;
}

export default function CartIcons({ size = "md", color, className }: CartIconProps) {
  return (
    <FaShoppingCart
      size={sizeMap[size]}
      className={[color, className].filter(Boolean).join(" ")}
    />
  );
}
