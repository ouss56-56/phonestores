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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    // Smooth scroll to featured collection to see results
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
  };

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
        <CategoryShowcase
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategory}
        />
        <FeaturedCollection
          onQuickView={handleQuickView}
          categoryId={selectedCategory}
          onClearFilter={() => setSelectedCategory(null)}
        />
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
