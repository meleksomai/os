import { GenerateImage } from "@/lib/og";

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default function Image() {
  return GenerateImage({
    size,
    title: "Hi, I am Melek Somai.",
    subtitle: "Physician. Scientist. Innovator.",
  });
}
