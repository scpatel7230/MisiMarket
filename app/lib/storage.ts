// =============================================================================
// FILE: app/lib/storage.ts
// PURPOSE:
//   Handles uploading invoice PDF/image files to cloud storage so they are
//   permanently saved and accessible for OCR processing and record-keeping.
//   Uses Supabase Storage (like an S3-compatible file bucket).
//
// HOW IT WORKS:
//   When the user uploads an invoice in /invoice-scanner, the file is sent
//   to POST /api/scan-invoice. That route calls uploadInvoiceFile() here,
//   which streams the file to a Supabase storage bucket called "invoices".
//   The returned public URL is then passed to the OCR service (app/lib/ocr.ts)
//   and also saved in the Invoice DB record for future reference.
//
// TO ACTIVATE:
//   Step 1: Create a Supabase project at supabase.com (free tier is fine)
//   Step 2: In the Supabase dashboard, go to Storage > New Bucket
//           Name it "invoices". Set it to PRIVATE (not public) if you
//           want to control access, or PUBLIC for simplest setup.
//   Step 3: Install the Supabase SDK:
//           npm install @supabase/supabase-js
//   Step 4: Set in .env.local:
//           NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//           SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  (from Settings > API)
//           NOTE: Use the SERVICE ROLE key here, NOT the anon key.
//                 The service role key has full storage access and must
//                 NEVER be exposed to the browser — server-side only.
//
// TO SWAP FOR AWS S3:
//   Replace the supabase client calls with the AWS SDK:
//   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
//   Then use PutObjectCommand to upload and GetObjectCommand to retrieve.
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role — server-side only
);

const BUCKET = "invoices";

export async function uploadInvoiceFile(
  file: File,
  restaurantId: string
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${restaurantId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteInvoiceFile(fileUrl: string) {
  // Extract the path from the public URL
  const path = fileUrl.split(`/${BUCKET}/`)[1];
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
