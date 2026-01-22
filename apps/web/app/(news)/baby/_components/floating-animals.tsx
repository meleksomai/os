"use client";

import Image from "next/image";

interface FloatingItem {
  src: string;
  alt: string;
  size: number;
  position: { x: number; y: number };
  rotation: number;
  floatX: { range: number; duration: number };
  floatY: { range: number; duration: number };
  delay: number;
}

const animals: FloatingItem[] = [
  {
    src: "/images/baby/animals/fox.svg",
    alt: "Fox",
    size: 80,
    position: { x: 5, y: 10 },
    rotation: -15,
    floatX: { range: 20, duration: 8 },
    floatY: { range: 15, duration: 6 },
    delay: 0,
  },
  {
    src: "/images/baby/animals/deer.svg",
    alt: "Deer",
    size: 90,
    position: { x: 85, y: 15 },
    rotation: 10,
    floatX: { range: 15, duration: 7 },
    floatY: { range: 25, duration: 9 },
    delay: 0.5,
  },
  {
    src: "/images/baby/animals/penguin.svg",
    alt: "Penguin",
    size: 60,
    position: { x: 10, y: 60 },
    rotation: 5,
    floatX: { range: 25, duration: 10 },
    floatY: { range: 18, duration: 7 },
    delay: 1,
  },
  {
    src: "/images/baby/animals/lion.svg",
    alt: "Lion",
    size: 85,
    position: { x: 80, y: 70 },
    rotation: -8,
    floatX: { range: 18, duration: 9 },
    floatY: { range: 22, duration: 8 },
    delay: 1.5,
  },
  {
    src: "/images/baby/animals/giraffe.svg",
    alt: "Giraffe",
    size: 95,
    position: { x: 45, y: 5 },
    rotation: 12,
    floatX: { range: 22, duration: 11 },
    floatY: { range: 16, duration: 6.5 },
    delay: 0.3,
  },
  {
    src: "/images/baby/animals/turtle.svg",
    alt: "Turtle",
    size: 55,
    position: { x: 25, y: 80 },
    rotation: -5,
    floatX: { range: 12, duration: 12 },
    floatY: { range: 20, duration: 10 },
    delay: 2,
  },
  {
    src: "/images/baby/animals/sheep.svg",
    alt: "Sheep",
    size: 70,
    position: { x: 70, y: 40 },
    rotation: 8,
    floatX: { range: 20, duration: 8.5 },
    floatY: { range: 14, duration: 7.5 },
    delay: 0.8,
  },
  {
    src: "/images/baby/animals/chicken.svg",
    alt: "Chicken",
    size: 50,
    position: { x: 15, y: 35 },
    rotation: -12,
    floatX: { range: 16, duration: 7 },
    floatY: { range: 24, duration: 9.5 },
    delay: 1.2,
  },
  {
    src: "/images/baby/animals/unicoen.svg",
    alt: "Unicorn",
    size: 75,
    position: { x: 55, y: 75 },
    rotation: 15,
    floatX: { range: 24, duration: 10.5 },
    floatY: { range: 18, duration: 8 },
    delay: 0.6,
  },
];

// Generate stars with varied sizes and positions
const starPositions = [
  { x: 3, y: 5, size: 20 },
  { x: 12, y: 18, size: 35 },
  { x: 22, y: 3, size: 25 },
  { x: 30, y: 12, size: 15 },
  { x: 42, y: 8, size: 40 },
  { x: 55, y: 2, size: 18 },
  { x: 65, y: 15, size: 30 },
  { x: 78, y: 5, size: 22 },
  { x: 88, y: 12, size: 45 },
  { x: 95, y: 3, size: 28 },
  { x: 5, y: 45, size: 18 },
  { x: 18, y: 55, size: 32 },
  { x: 32, y: 42, size: 20 },
  { x: 62, y: 48, size: 25 },
  { x: 82, y: 52, size: 15 },
  { x: 93, y: 38, size: 35 },
  { x: 8, y: 88, size: 28 },
  { x: 20, y: 92, size: 22 },
  { x: 38, y: 85, size: 40 },
  { x: 52, y: 90, size: 18 },
  { x: 68, y: 82, size: 30 },
  { x: 78, y: 95, size: 25 },
  { x: 92, y: 78, size: 20 },
  { x: 48, y: 65, size: 15 },
  { x: 2, y: 30, size: 22 },
  { x: 96, y: 62, size: 18 },
];

const stars: FloatingItem[] = starPositions.map((star, i) => ({
  src: "/images/baby/decorations/stars.svg",
  alt: `Star ${i + 1}`,
  size: star.size,
  position: { x: star.x, y: star.y },
  rotation: ((i * 37) % 60) - 30,
  floatX: { range: 4 + (i % 5) * 2, duration: 10 + (i % 6) },
  floatY: { range: 5 + (i % 4) * 2, duration: 8 + (i % 5) },
  delay: (i * 0.15) % 3,
}));

const decorations: FloatingItem[] = [
  {
    src: "/images/baby/decorations/ballon-blue.svg",
    alt: "Blue Balloon",
    size: 65,
    position: { x: 92, y: 45 },
    rotation: 5,
    floatX: { range: 12, duration: 9 },
    floatY: { range: 30, duration: 7 },
    delay: 0.2,
  },
  {
    src: "/images/baby/decorations/balloon-yellow.svg",
    alt: "Yellow Balloon",
    size: 60,
    position: { x: 3, y: 75 },
    rotation: -8,
    floatX: { range: 15, duration: 10 },
    floatY: { range: 28, duration: 8 },
    delay: 0.7,
  },
  {
    src: "/images/baby/decorations/baloon-pink.svg",
    alt: "Pink Balloon",
    size: 55,
    position: { x: 35, y: 25 },
    rotation: 10,
    floatX: { range: 18, duration: 11 },
    floatY: { range: 25, duration: 6.5 },
    delay: 1.1,
  },
  {
    src: "/images/baby/decorations/biberon.svg",
    alt: "Baby Bottle",
    size: 50,
    position: { x: 88, y: 85 },
    rotation: -15,
    floatX: { range: 14, duration: 9.5 },
    floatY: { range: 16, duration: 7.5 },
    delay: 1.3,
  },
  {
    src: "/images/baby/decorations/succing.svg",
    alt: "Pacifier",
    size: 45,
    position: { x: 40, y: 50 },
    rotation: 12,
    floatX: { range: 20, duration: 8 },
    floatY: { range: 15, duration: 10 },
    delay: 0.9,
  },
];

const floatingItems = [...animals, ...stars, ...decorations];

export function FloatingAnimals() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {floatingItems.map((item) => (
        <div
          className="absolute animate-float-x"
          key={item.alt}
          style={
            {
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              "--float-x-range": `${item.floatX.range}px`,
              "--float-x-duration": `${item.floatX.duration}s`,
              "--float-delay": `${item.delay}s`,
            } as React.CSSProperties
          }
        >
          <div
            className="animate-float-y"
            style={
              {
                width: item.size,
                height: item.size,
                rotate: `${item.rotation}deg`,
                "--float-y-range": `${item.floatY.range}px`,
                "--float-y-duration": `${item.floatY.duration}s`,
                "--float-delay": `${item.delay}s`,
              } as React.CSSProperties
            }
          >
            <Image
              alt={item.alt}
              className="h-full w-full object-contain"
              height={item.size}
              priority={false}
              src={item.src}
              width={item.size}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
