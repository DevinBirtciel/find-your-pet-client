/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef } from 'react';
import { Button } from '@mui/material';
// import Image from 'next/image';
import '../app/upload.css';

export default function Home() {
  const lookingForPetInputRef = useRef<HTMLInputElement>(null);
  const foundPetInputRef = useRef<HTMLInputElement>(null);

  const LAMBDA_UPLOAD_URL = 'https://api.find-your-pets.com/get-signed-url';

  const handleLookingForPetClick = () => {
    lookingForPetInputRef.current?.click();
  };

  const handleFoundPetClick = () => {
    foundPetInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, buttonType: 'looking' | 'found') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('type', buttonType);

      try {
        // get presigned URL from lambda
        const url = `${LAMBDA_UPLOAD_URL}?key=${file.name}&contentType=${file.type}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://api.find-your-pets.com',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });

        if (!response.ok) {
          throw new Error('Getting presigned URL failed');
        }

        // upload the file to S3 using presigned URL
        const { signedUrl } = await response.json();
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });
        if (!uploadResponse.ok) {
          throw new Error('Uploading file to S3 failed');
        }
        // handle the response from S3
        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);

        await uploadResponse.json();
        alert('Photo uploaded successfully!');
      } catch (error) {
        console.error(error);
        alert('Error uploading photo.');
      }
    }
  };

  return (
    <main className="background-image">
      <div className="formatting">
        <h1 className="title">Find Your Pets</h1>
        <h2 className="subtitle">Help a lost pet make its way home by uploading a photo</h2>
        <div className="fullscreen-image">
          <img src="/pet.jpg" alt="find-your-pets Logo" />
        </div>
        <div className="button-row">
          <Button onClick={handleLookingForPetClick} variant="text" color="primary" className={'button-formatting'}>
            Looking for Pet
          </Button>
          <input
            type="file"
            ref={lookingForPetInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'looking')}
          />
          <Button onClick={handleFoundPetClick} variant="text" color="primary" className={'button-formatting'}>
            Found Pet
          </Button>
          <input
            type="file"
            ref={foundPetInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'found')}
          />
        </div>
      </div>
    </main>
  );
}
