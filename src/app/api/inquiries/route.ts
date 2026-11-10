import { NextRequest } from 'next/server';
import { createInquiry, getWorkerInquiries } from '@/server/services/inquiry.service';
import { successResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireFreelancerOrAdmin } from '@/server/utils/auth-check';
import { InquiryCreateSchema } from '@/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InquiryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid inquiry form data.');
    }

    const inquiry = await createInquiry(parsed.data);
    return successResponse(inquiry, 'Inquiry sent directly to specialist.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to submit direct inquiry.');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');
    if (!workerId) {
      return errorResponse('workerId parameter is required.');
    }

    const authResult = await requireFreelancerOrAdmin(workerId);
    if (!authResult) {
      return forbiddenResponse('Not authorized to view inquiries for this profile.');
    }

    const inquiries = await getWorkerInquiries(workerId);
    return successResponse(inquiries);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch inquiries.');
  }
}
