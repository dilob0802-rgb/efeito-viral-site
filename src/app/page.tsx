import Hero from '@/components/Hero';
import Problems from '@/components/Problems';
import Solution from '@/components/Solution';
import SaaSFeatures from '@/components/SaaSFeatures';
import ApplicationForm from '@/components/ApplicationForm';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <Problems />
      <Solution />
      <SaaSFeatures />
      <ApplicationForm />
      <Footer />
    </main>
  );
}
