import Hero from '@/components/Hero';
import Problems from '@/components/Problems';
import Solution from '@/components/Solution';
import SaaSFeatures from '@/components/SaaSFeatures';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import ApplicationForm from '@/components/ApplicationForm';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

export default function Home() {
  return (
    <main>
      <ScrollReveal direction="down">
        <Hero />
      </ScrollReveal>

      <ScrollReveal>
        <Problems />
      </ScrollReveal>

      <ScrollReveal>
        <Solution />
      </ScrollReveal>

      <ScrollReveal direction="left">
        <SaaSFeatures />
      </ScrollReveal>

      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      <ScrollReveal>
        <FAQ />
      </ScrollReveal>
      
      <ScrollReveal>
        <ApplicationForm />
      </ScrollReveal>

      <Footer />
    </main>
  );
}
