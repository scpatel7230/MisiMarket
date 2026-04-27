// =============================================================================
// FILE: app/lib/ocr.ts
// PURPOSE:
//   Sends an uploaded invoice file to Google Document AI and extracts the
//   line items (product name, unit price, quantity) as structured data.
//   This is the "brain" of the invoice scanner — it turns a PDF or photo
//   into a list of items the app can compare against your price history.
//
// HOW IT WORKS:
//   1. app/api/scan-invoice/route.ts uploads the file and gets back a URL
//   2. It calls extractInvoiceLineItems(fileUrl) from this file
//   3. This function fetches the file, converts it to base64, and sends
//      it to the Google Document AI API
//   4. Google's AI reads the invoice and returns structured "entities"
//   5. This function maps those entities to the InvoiceLineItem type
//   6. The API route then enriches each item with the previous price from
//      the DB to calculate the price diff (overcharge detection)
//
// TO ACTIVATE:
//   Step 1: Go to console.cloud.google.com
//           Enable the "Document AI API" for your project
//   Step 2: In Document AI, create a new processor
//           Choose "Invoice Parser" (best for supplier invoices)
//           Note your Project ID and Processor ID
//   Step 3: Create a Service Account:
//           IAM > Service Accounts > Create > give it "Document AI API User" role
//           Download the JSON key file
//           Save it as google-service-account.json in the project root
//           (it is already in .gitignore — NEVER commit this file)
//   Step 4: Install the package:
//           npm install @google-cloud/documentai
//   Step 5: Set in .env.local:
//           GOOGLE_CLOUD_PROJECT_ID=your-project-id
//           GOOGLE_CLOUD_PROCESSOR_ID=your-processor-id
//           GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
//
// IMPORTANT — FIELD MAPPING:
//   The entity field names (line_item/description, line_item/unit_price etc.)
//   depend on which processor type you chose. If results look wrong, open
//   Prisma Studio to inspect raw data and adjust the field names in the
//   .map() block at the bottom of this file.
//
// CHEAPER ALTERNATIVE: AWS Textract
//   npm install @aws-sdk/client-textract
//   Use AnalyzeExpenseCommand for invoice parsing.
// =============================================================================

import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import type { InvoiceLineItem } from "./data";

const client = new DocumentProcessorServiceClient();

export async function extractInvoiceLineItems(
  fileUrl: string
): Promise<InvoiceLineItem[]> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
  const processorId = process.env.GOOGLE_CLOUD_PROCESSOR_ID!;
  const location = "us"; // or "eu"

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  // Fetch the file from storage
  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();
  const content = Buffer.from(buffer).toString("base64");

  const mimeType = fileUrl.endsWith(".pdf") ? "application/pdf" : "image/jpeg";

  const [result] = await client.processDocument({
    name,
    rawDocument: { content, mimeType },
  });

  const document = result.document;
  if (!document?.entities) return [];

  // Parse entities into line items
  // NOTE: Field names depend on your processor type.
  // "Invoice Parser" returns structured fields — adjust the mapping below.
  const lineItems: InvoiceLineItem[] = document.entities
    .filter((e) => e.type === "line_item")
    .map((entity) => {
      const fields: Record<string, string> = {};
      for (const prop of entity.properties ?? []) {
        fields[prop.type ?? ""] = prop.mentionText ?? "";
      }
      return {
        item: fields["line_item/description"] ?? "Unknown",
        previousPrice: 0, // look up from DB
        currentPrice: parseFloat(fields["line_item/unit_price"] ?? "0"),
        quantity: parseFloat(fields["line_item/quantity"] ?? "1"),
        unit: fields["line_item/unit"] ?? "each",
        diff: 0, // calculated after DB lookup
      };
    });

  return lineItems;
}
