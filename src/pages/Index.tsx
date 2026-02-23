import { useState } from "react";
import Navbar from "@/components/store/Navbar";
import ThreadLine from "@/components/store/ThreadLine";
import HeroSection from "@/components/store/HeroSection";
import CategoryShowcase from "@/components/store/CategoryShowcase";
import FeaturedCollection from "@/components/store/FeaturedCollection";
import ProductHighlight from "@/components/store/ProductHighlight";
import InquiryForm from "@/components/store/InquiryForm";
import Footer from "@/components/store/Footer";
import QuickViewModal from "@/components/store/QuickViewModal";
import { StoreProduct } from "@/services/storeApi";

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product: StoreProduct) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => setSelectedProduct(null), 300); // Wait for animation
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <ThreadLine />
      <Navbar />
      <HeroSection />

      <main className="relative">
        <CategoryShowcase />
        <FeaturedCollection onQuickView={handleQuickView} />
        <ProductHighlight />
        <InquiryForm />
      </main>

      <Footer />

      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </div>
  );
};

export default Index;
