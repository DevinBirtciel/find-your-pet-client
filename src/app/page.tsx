import { Button } from "@mui/material";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button variant="text" color="primary" className="mt-4">
        Looking for Pet
      </Button>
      <Button variant="text" color="primary" className="mt-4">
        Found Pet
      </Button>
      <Image
        src="/pet.jpg"
        alt="find-your-pets Logo"
        width={400}
        height={300}
        priority
      />
    </main>
  );
}
