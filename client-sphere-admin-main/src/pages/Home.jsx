import HeroSection from "../components/homecomponents/HeroSection";
import HomePage from "../components/homecomponents/HomePage";


export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <HeroSection/>
      <HomePage/>
    </div>
  );
}
