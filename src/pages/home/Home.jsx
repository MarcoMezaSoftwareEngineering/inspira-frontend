import Hero from "./sections/Hero";
import QuickCalc from "./sections/QuickCalc";
import RutasMigrar from "./sections/RutasMigrar";
import Asesorias from "./sections/Asesorias";
import Metrics from "./sections/Metrics";
import ComoFunciona from "./sections/ComoFunciona";
import Servicios from "./sections/Servicios";
import SabiasQue from "./sections/SabiasQue";
import PorQue from "./sections/PorQue";
import Testimonios from "./sections/Testimonios";
import Compare from "./sections/Compare";
import Faq from "./sections/Faq";
import CtaFinal from "./sections/CtaFinal";

export default function Home() {
  return (
    <main className="v4-home">
      <Hero />
      <QuickCalc />
      <RutasMigrar />
      <Asesorias />
      <Metrics />
      <ComoFunciona />
      <Servicios />
      <SabiasQue />
      <PorQue />
      <Testimonios />
      <Compare />
      <Faq />
      <CtaFinal />
    </main>
  );
}
