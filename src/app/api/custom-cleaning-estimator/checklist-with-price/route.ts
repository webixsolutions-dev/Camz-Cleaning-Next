import { NextRequest } from "next/server";
import { submitCustomCleaningRequest } from "@/lib/custom-cleaning-submission";

export async function POST(request: NextRequest) {
  return submitCustomCleaningRequest(request, "price");
}
