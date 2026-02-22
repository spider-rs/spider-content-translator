import Translator from "./translator";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Translator />
      <Toaster />
    </main>
  );
}
