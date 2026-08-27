import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhyPacifique from '@/components/WhyPacifique';
import Formation from '@/components/Formation';
import About from '@/components/About';
import Approach from '@/components/Approach';
import Gallery from '@/components/Gallery';
import Contact from '@/components/Contact';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import { ScrollProgress } from '@/components/ui';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <WhyPacifique />
        <Formation />
        <About />
        <Approach />
        <Gallery />
        <Contact />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;