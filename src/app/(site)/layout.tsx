import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyBookButton from "@/components/layout/StickyBookButton";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyBookButton />
    </>
  );
}
