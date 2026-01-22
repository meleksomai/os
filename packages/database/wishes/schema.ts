export interface Wish {
  id: string;
  name: string;
  email: string;
  message: string;
  is_public: boolean;
  reviewed: boolean | null;
  created_at: string;
}

export interface PublicWish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export interface WishInput {
  name: string;
  email: string;
  message: string;
  isPublic: boolean;
}

export const WISHES_TABLE_SCHEMA = `
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed BOOLEAN DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
