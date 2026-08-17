import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeaturedClasses } from "@/components/featured-classes";
import { ClassSchedule } from "@/components/class-schedule";
import { HowToBook } from "@/components/how-to-book";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <FeaturedClasses />
        <ClassSchedule />
        <HowToBook />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
