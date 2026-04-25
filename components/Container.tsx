import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "article";
};

export default function Container({
  children,
  className = "",
  as: Tag = "div",
}: Props) {
  return (
    <Tag className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>
      {children}
    </Tag>
  );
}
