import { ElementType } from "react";
import {
  FaWifi,
  FaSwimmer,
  FaLeaf,
  FaCoffee,
  FaCar,
  FaTv,
  FaSnowflake,
  FaPaw,
  FaWineBottle,
  FaSmile,
  FaTshirt,
  FaGlassMartiniAlt,
  FaSmokingBan,
  FaUmbrella,
  FaDoorClosed,
  FaSuitcaseRolling,
  FaQuestion // Added as a fallback
} from "react-icons/fa";

// 1. The strict mapping dictionary
export const IconMap: Record<string, ElementType> = {
  FaWifi,
  FaSwimmer,
  FaLeaf,
  FaCoffee,
  FaCar,
  FaTv,
  FaSnowflake,
  FaPaw,
  FaWineBottle,
  FaSmile,
  FaTshirt,
  FaGlassMartiniAlt,
  FaSmokingBan,
  FaUmbrella,
  FaDoorClosed,
  FaSuitcaseRolling,
};

// 2. A reusable helper component
interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon = ({ name, className, size = 20 }: DynamicIconProps) => {
  // If the string from the database matches our map, use it. 
  const IconComponent = IconMap[name] || FaQuestion; 

  return <IconComponent className={className} size={size} />;
};