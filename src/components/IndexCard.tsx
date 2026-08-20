import React from "react";
import { CardStyle } from "../types";
import { IndexVariants } from "./cardStylesIndex";
import { IndexStyleProps } from "./cardStyleProps";

interface IndexCardProps extends IndexStyleProps {
  style: CardStyle;
}

export const IndexCard: React.FC<IndexCardProps> = ({ style, ...props }) => {
  const Variant = IndexVariants[style];
  return <Variant {...props} />;
};
