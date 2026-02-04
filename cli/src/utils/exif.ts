import { readFile } from "node:fs/promises";
import ExifReader from "exifreader";

export interface ImageMetadata {
  dateTaken: Date | null;
  make: string | null;
  model: string | null;
  width: number | null;
  height: number | null;
}

export function parseExifDate(dateString: string): Date | null {
  // EXIF date format: "YYYY:MM:DD HH:MM:SS"
  const match = dateString.match(
    /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
}

export async function readImageMetadata(
  filePath: string
): Promise<ImageMetadata> {
  const buffer = await readFile(filePath);
  const tags = ExifReader.load(buffer);

  let dateTaken: Date | null = null;

  // Try different date fields in order of preference
  const dateFields = [
    "DateTimeOriginal",
    "DateTimeDigitized",
    "DateTime",
    "CreateDate",
  ];

  for (const field of dateFields) {
    const dateTag = tags[field];
    if (dateTag?.description) {
      dateTaken = parseExifDate(dateTag.description);
      if (dateTaken) {
        break;
      }
    }
  }

  // If no EXIF date found, try to use file stats as a fallback
  // This will be handled by the caller

  return {
    dateTaken,
    make: tags.Make?.description ?? null,
    model: tags.Model?.description ?? null,
    width: tags["Image Width"]?.value ?? null,
    height: tags["Image Height"]?.value ?? null,
  };
}

export function formatTimestamp(date: Date): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `'${year} ${month} ${day}`;
}
