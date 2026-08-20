import React from "react";
import { CardStyle } from "../types";
import { DetailVariants } from "./cardStylesDetail";
import { DetailStyleProps } from "./cardStyleProps";

interface DetailCardProps extends DetailStyleProps {
  style: CardStyle;
}

export const DetailCard: React.FC<DetailCardProps> = ({ style, ...props }) => {
  const Variant = DetailVariants[style];
  return <Variant {...props} />;
};
