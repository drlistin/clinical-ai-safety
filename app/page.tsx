import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import LaunchModules from "@/components/LaunchModules";
import SimulatorHighlight from "@/components/SimulatorHighlight";
import FrameworksGrid from "@/components/FrameworksGrid";
import EmailCapture from "@/components/EmailCapture";
import Disclaimer from "@/components/Disclaimer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <LaunchModules />
      <SimulatorHighlight />
      <FrameworksGrid />
      <EmailCapture />
      <Disclaimer />
    </>
  );
}
