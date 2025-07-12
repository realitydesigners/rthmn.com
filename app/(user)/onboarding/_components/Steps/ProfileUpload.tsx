"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LuImagePlus, LuUpload } from "react-icons/lu";

interface Props {
  onPhotoUpload: (url: string) => void;
}

export default function ProfileUpload({ onPhotoUpload }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      // Validate file size (e.g., 2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("File size must be less than 2MB");
      }

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Convert image to base64 for localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem("avatar_url", base64String);
        onPhotoUpload(base64String);
        router.refresh();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert(error instanceof Error ? error.message : "Error uploading photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleFileUpload(fakeEvent);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-russo text-2xl sm:text-3xl font-bold text-white"
        >
          Welcome to Rthmn
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-kodemono text-sm sm:text-base text-white/60"
        >
          You can add a profile photo to personalize your experience, or skip
          this step.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center py-2 sm:py-4"
      >
        <div className="relative">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isLoading}
          />

          {/* Upload Area */}
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative"
          >
            {/* Main upload button/area */}
            <motion.div
              animate={{
                scale: isDragging ? 1.02 : 1,
              }}
              className="group relative flex h-48 w-48 sm:h-64 sm:w-64 cursor-pointer flex-col items-center justify-center overflow-hidden transition-all duration-300"
              style={{
                borderRadius: "16px",
                background:
                  "linear-gradient(180deg, #0F1114 -10.71%, #080A0D 100%)",
                border: isDragging
                  ? "2px dashed #24FF66/50"
                  : "2px dashed #16181C",
              }}
            >
              {/* Outer glow ring */}
              <div
                className="absolute -inset-px rounded-2xl opacity-30"
                style={{
                  background:
                    "linear-gradient(180deg, #32353C/20 0%, transparent 50%)",
                  filter: "blur(0.5px)",
                }}
              />

              {/* Top highlight gradient */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4EFF6E]/15 to-transparent" />

              {/* Bottom subtle shadow line */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />

              {/* Subtle inner glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(180deg, #32353C/15 0%, transparent 50%)",
                }}
              />

              {/* Inner border for depth */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)",
                }}
              />

              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 h-full w-full"
                  >
                    <Image
                      src={preview}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 192px, 256px"
                      priority
                    />
                    {/* Hover overlay with glass effect */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/0 via-black/20 to-black/60 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                      <div
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white backdrop-blur-md relative"
                        style={{
                          borderRadius: "20px",
                          background:
                            "linear-gradient(180deg, #0F1114 -10.71%, #080A0D 100%)",
                          border: "1px solid #24FF66/30",
                        }}
                      >
                        {/* Subtle inner glow */}
                        <div
                          className="pointer-events-none absolute inset-0 opacity-10"
                          style={{
                            borderRadius: "20px",
                            background:
                              "linear-gradient(180deg, #32353C/15 0%, transparent 50%)",
                          }}
                        />
                        <LuUpload className="h-3 w-3 sm:h-4 sm:w-4 text-[#24FF66]" />
                        <span className="font-kodemono relative z-10">
                          Change Photo
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 text-center"
                  >
                    <div className="rounded-full bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 p-3 sm:p-4 transition-colors duration-300 group-hover:from-[#24FF66]/30 group-hover:via-[#24FF66]/15 group-hover:to-[#24FF66]/10">
                      <LuImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-[#24FF66]" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="font-kodemono text-xs sm:text-sm font-medium text-white">
                        Drop your photo here
                      </div>
                      <div className="font-kodemono text-[10px] sm:text-xs text-white/50">
                        or click to browse
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-gradient-to-b from-black/60 via-black/70 to-black/80 backdrop-blur-sm"
                >
                  <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-white/30 border-b-[#24FF66]"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File type info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-kodemono mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-white/50"
          >
            PNG or JPG (max. 2MB)
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
