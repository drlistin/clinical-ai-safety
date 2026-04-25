import { ReactNode } from "react";
import Container from "./Container";

type Props = {
  children: ReactNode;
  className?: string;
  tone?: "light" | "navy" | "mist";
  id?: string;
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  light: "bg-white text-navy-900",
  mist: "bg-navy-50 text-navy-900",
  navy: "bg-navy-900 text-white",
};

export default function Section({
  children,
  className = "",
  tone = "light",
  id,
}: Props) {
  return (
    <section
      id={id}
      className={`${toneClasses[tone]} border-b border-navy-100/60 ${className}`}
    >
      <Container className="py-20 md:py-28">{children}</Container>
    </section>
  );
}
