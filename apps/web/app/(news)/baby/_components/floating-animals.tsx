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

// Animals distributed across 300vh (y values 0-95 map to full height)
const animals: FloatingItem[] = [
  {
    src: "/images/baby/animals/fox.svg",
    alt: "Fox",
    size: 80,
    position: { x: 5, y: 5 },
    rotation: -15,
    floatX: { range: 20, duration: 8 },
    floatY: { range: 15, duration: 6 },
    delay: 0,
  },
  {
    src: "/images/baby/animals/deer.svg",
    alt: "Deer",
    size: 90,
    position: { x: 85, y: 12 },
    rotation: 10,
    floatX: { range: 15, duration: 7 },
    floatY: { range: 25, duration: 9 },
    delay: 0.5,
  },
  {
    src: "/images/baby/animals/penguin.svg",
    alt: "Penguin",
    size: 60,
    position: { x: 10, y: 25 },
    rotation: 5,
    floatX: { range: 25, duration: 10 },
    floatY: { range: 18, duration: 7 },
    delay: 1,
  },
  {
    src: "/images/baby/animals/lion.svg",
    alt: "Lion",
    size: 85,
    position: { x: 80, y: 38 },
    rotation: -8,
    floatX: { range: 18, duration: 9 },
    floatY: { range: 22, duration: 8 },
    delay: 1.5,
  },
  {
    src: "/images/baby/animals/giraffe.svg",
    alt: "Giraffe",
    size: 95,
    position: { x: 45, y: 2 },
    rotation: 12,
    floatX: { range: 22, duration: 11 },
    floatY: { range: 16, duration: 6.5 },
    delay: 0.3,
  },
  {
    src: "/images/baby/animals/turtle.svg",
    alt: "Turtle",
    size: 55,
    position: { x: 25, y: 55 },
    rotation: -5,
    floatX: { range: 12, duration: 12 },
    floatY: { range: 20, duration: 10 },
    delay: 2,
  },
  {
    src: "/images/baby/animals/sheep.svg",
    alt: "Sheep",
    size: 70,
    position: { x: 70, y: 68 },
    rotation: 8,
    floatX: { range: 20, duration: 8.5 },
    floatY: { range: 14, duration: 7.5 },
    delay: 0.8,
  },
  {
    src: "/images/baby/animals/chicken.svg",
    alt: "Chicken",
    size: 50,
    position: { x: 15, y: 78 },
    rotation: -12,
    floatX: { range: 16, duration: 7 },
    floatY: { range: 24, duration: 9.5 },
    delay: 1.2,
  },
  {
    src: "/images/baby/animals/unicoen.svg",
    alt: "Unicorn",
    size: 75,
    position: { x: 55, y: 88 },
    rotation: 15,
    floatX: { range: 24, duration: 10.5 },
    floatY: { range: 18, duration: 8 },
    delay: 0.6,
  },
];

// Stars distributed evenly across the full 300vh page height
const starPositions = [
  // Top section (0-33%)
  { x: 3, y: 2, size: 20 },
  { x: 22, y: 1, size: 25 },
  { x: 42, y: 3, size: 40 },
  { x: 65, y: 5, size: 30 },
  { x: 88, y: 4, size: 45 },
  { x: 12, y: 10, size: 35 },
  { x: 55, y: 8, size: 18 },
  { x: 78, y: 12, size: 22 },
  { x: 95, y: 15, size: 28 },
  { x: 30, y: 18, size: 15 },
  { x: 8, y: 22, size: 28 },
  { x: 50, y: 20, size: 32 },
  { x: 85, y: 25, size: 20 },
  // Middle section (33-66%)
  { x: 5, y: 35, size: 18 },
  { x: 25, y: 38, size: 35 },
  { x: 45, y: 33, size: 22 },
  { x: 70, y: 40, size: 25 },
  { x: 92, y: 36, size: 30 },
  { x: 15, y: 48, size: 20 },
  { x: 38, y: 45, size: 40 },
  { x: 62, y: 50, size: 18 },
  { x: 82, y: 52, size: 15 },
  { x: 3, y: 58, size: 28 },
  { x: 55, y: 55, size: 35 },
  { x: 96, y: 60, size: 22 },
  // Bottom section (66-100%)
  { x: 20, y: 68, size: 25 },
  { x: 48, y: 65, size: 15 },
  { x: 75, y: 70, size: 32 },
  { x: 8, y: 75, size: 40 },
  { x: 35, y: 72, size: 18 },
  { x: 90, y: 78, size: 28 },
  { x: 58, y: 82, size: 22 },
  { x: 12, y: 85, size: 30 },
  { x: 42, y: 88, size: 20 },
  { x: 78, y: 90, size: 35 },
  { x: 25, y: 93, size: 25 },
  { x: 65, y: 95, size: 18 },
  { x: 95, y: 92, size: 40 },
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

// Decorations distributed across the page
const decorations: FloatingItem[] = [
  {
    src: "/images/baby/decorations/ballon-blue.svg",
    alt: "Blue Balloon",
    size: 65,
    position: { x: 92, y: 15 },
    rotation: 5,
    floatX: { range: 12, duration: 9 },
    floatY: { range: 30, duration: 7 },
    delay: 0.2,
  },
  {
    src: "/images/baby/decorations/balloon-yellow.svg",
    alt: "Yellow Balloon",
    size: 60,
    position: { x: 3, y: 45 },
    rotation: -8,
    floatX: { range: 15, duration: 10 },
    floatY: { range: 28, duration: 8 },
    delay: 0.7,
  },
  {
    src: "/images/baby/decorations/baloon-pink.svg",
    alt: "Pink Balloon",
    size: 55,
    position: { x: 88, y: 60 },
    rotation: 10,
    floatX: { range: 18, duration: 11 },
    floatY: { range: 25, duration: 6.5 },
    delay: 1.1,
  },
  {
    src: "/images/baby/decorations/biberon.svg",
    alt: "Baby Bottle",
    size: 50,
    position: { x: 8, y: 82 },
    rotation: -15,
    floatX: { range: 14, duration: 9.5 },
    floatY: { range: 16, duration: 7.5 },
    delay: 1.3,
  },
  {
    src: "/images/baby/decorations/succing.svg",
    alt: "Pacifier",
    size: 45,
    position: { x: 90, y: 92 },
    rotation: 12,
    floatX: { range: 20, duration: 8 },
    floatY: { range: 15, duration: 10 },
    delay: 0.9,
  },
];

const floatingItems = [...animals, ...stars, ...decorations];

const keyframes = `
  @keyframes baby-float-x {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(var(--fx, 20px)); }
  }
  @keyframes baby-float-y {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(var(--fy, 15px)); }
  }
`;

export function FloatingAnimals() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div className="pointer-events-none absolute inset-0">
        {floatingItems.map((item) => (
          <div
            className="absolute"
            key={item.alt}
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              animation: `baby-float-x ${item.floatX.duration}s ease-in-out infinite`,
              animationDelay: `${item.delay}s`,
              // @ts-expect-error CSS custom property
              "--fx": `${item.floatX.range}px`,
            }}
          >
            <div
              style={{
                width: item.size,
                height: item.size,
                transform: `rotate(${item.rotation}deg)`,
                animation: `baby-float-y ${item.floatY.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error CSS custom property
                "--fy": `${item.floatY.range}px`,
              }}
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
    </>
  );
}
