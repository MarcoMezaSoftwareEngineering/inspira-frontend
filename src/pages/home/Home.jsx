import Hero from "./sections/Hero";
import QuickCalc from "./sections/QuickCalc";
import Metrics from "./sections/Metrics";
import ComoFunciona from "./sections/ComoFunciona";
import Servicios from "./sections/Servicios";
import Compare from "./sections/Compare";
import CtaFinal from "./sections/CtaFinal";

export default function Home() {
  return (
    <main className="v4-home">
      <Hero />
      <QuickCalc />
      <Metrics />
      <ComoFunciona />
      <Servicios />
      <Compare />
      <CtaFinal />
    </main>
  );
}
