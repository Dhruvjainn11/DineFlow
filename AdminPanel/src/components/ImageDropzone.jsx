import React, { useState } from "react";
import { useForm } from "react-hook-form";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { useDropzone } from "react-dropzone";

export default function ImageDropzone({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const {
 
    setValue,
    formState: { errors },
  } = useForm();

//   const maxFileSize = 10 * 1024 * 1024; // 10MB


const onDrop = async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];

    try {
      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", "dienflow");

      // Upload to Cloudinary
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dpxnsl7hl/image/upload",
        formData
      );

      // Pass back URL to parent
      onUpload(res.data.secure_url);
    } catch (error) {
      alert("Failed to upload image");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });

  return (
    <div className="flex gap-5">
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 text-center cursor-pointer "
      >
        <input {...getInputProps()} />
        <p>Drag & drop your image here, or click to select</p>
      </div>

      {preview && (
        <div className="mt-4">
          <img src={preview} alt="Preview" className="w-40 h-40 " />
        </div>
      )}

      {errors.image && (
        <p className="text-red-500 mt-2 text-sm">{errors.image.message}</p>
      )}
    </div>
  );
}
