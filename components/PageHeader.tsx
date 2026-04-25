import Container from "./Container";

type Props = {
  kicker?: string;
  title: string;
  lede?: string;
};

export default function PageHeader({ kicker, title, lede }: Props) {
  return (
    <header className="relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(50,114,178,0.2),_transparent_60%)]"
      />
      <Container className="relative py-24 md:py-32">
        {kicker ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-300">
            {kicker}
          </p>
        ) : null}
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tightish md:text-5xl">
          {title}
        </h1>
        {lede ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-100 md:text-xl">
            {lede}
          </p>
        ) : null}
      </Container>
    </header>
  );
}
