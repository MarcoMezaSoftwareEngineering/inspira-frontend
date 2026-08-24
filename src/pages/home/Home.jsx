import Hero from "./sections/Hero";
import QuickCalc from "./sections/QuickCalc";
import Asesorias from "./sections/Asesorias";
import RutasMigrar from "./sections/RutasMigrar";
import Metrics from "./sections/Metrics";
import Servicios from "./sections/Servicios";
import PorQue from "./sections/PorQue";
import Testimonios from "./sections/Testimonios";
import Compare from "./sections/Compare";
import Faq from "./sections/Faq";
import CtaFinal from "./sections/CtaFinal";

// Nota: el detalle del proceso ya no vive aquí. Cada servicio explica sus
// propias etapas en su página (/servicios/<id>), porque el proceso de una
// visa no se parece al de una homologación.
export default function Home() {
  return (
    <main className="v4-home">
      <Hero />
      <QuickCalc />
      <Asesorias />
      <RutasMigrar />
      <Metrics />
      <Servicios />
      <PorQue />
      <Testimonios />
      <Compare />
      <Faq />
      <CtaFinal />
    </main>
  );
}
