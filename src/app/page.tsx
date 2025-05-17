"use client";

import { useRef } from "react";
import { Button } from "@mui/material";
import Image from "next/image";

export default function Home() {
  const lookingForPetInputRef = useRef<HTMLInputElement>(null);
  const foundPetInputRef = useRef<HTMLInputElement>(null);

  const LAMBDA_UPLOAD_URL = "https://find-your-pets/upload";

  const handleLookingForPetClick = () => {
    lookingForPetInputRef.current?.click();
  };

  const handleFoundPetClick = () => {
    foundPetInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    buttonType: "looking" | "found"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("type", buttonType);

      try {
        const response = await fetch(LAMBDA_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        await response.json();
        alert("Photo uploaded successfully!");
      } catch (error) {
        console.error(error);
        alert("Error uploading photo.");
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Image
        src="/pet.jpg"
        alt="find-your-pets Logo"
        width={400}
        height={300}
        priority
      />
      <div className="flex flex-row gap-4 mt-4">
        <Button onClick={handleLookingForPetClick} variant="text" color="primary">
          Looking for Pet
        </Button>
        <input
          type="file"
          ref={lookingForPetInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => handleFileChange(e, "looking")}
        />
        <Button onClick={handleFoundPetClick} variant="text" color="primary">
          Found Pet
        </Button>
        <input
          type="file"
          ref={foundPetInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => handleFileChange(e, "found")}
        />
      </div>
    </main>
  );
}