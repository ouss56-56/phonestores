import Navbar from "@/components/store/Navbar";
import HeroSection from "@/components/store/HeroSection";
import ProductGallery from "@/components/store/ProductGallery";
import FeaturesSection from "@/components/store/FeaturesSection";
import ReviewsSection from "@/components/store/ReviewsSection";
import Footer from "@/components/store/Footer";
import { LiquidDivider, ThreadLine } from "@/components/ui/animations";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <ThreadLine />
      <Navbar />
      <HeroSection />
      <LiquidDivider />
      <ProductGallery />
      <LiquidDivider color="hsl(35,90%,50%)" />
      <FeaturesSection />
      <LiquidDivider />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default Index;
