import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getServerSession, requireAdmin } from '@/server/utils/auth-check';
import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { ChangePasswordSchema, AdminCredentialsSchema } from '@/schemas';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return unauthorizedResponse('You must be logged in.');
    }

    const headerList = await headers();
    const body = await req.json();

    // Check if it's admin credential update
    if (body.adminUpdate) {
      const adminCheck = await requireAdmin();
      if (!adminCheck) {
        return forbiddenResponse('Administrator privileges required to update admin credentials.');
      }

      const parsed = AdminCredentialsSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(parsed.error.issues[0]?.message || 'Invalid admin credentials payload.');
      }

      const { currentPassword, newEmail, newName, newPassword } = parsed.data;

      // 1. Verify current password by attempting internal verification
      try {
        await auth.api.signInEmail({
          body: {
            email: session.user.email,
            password: currentPassword,
          },
        });
      } catch (e: any) {
        return errorResponse('Current administrator password is incorrect.', 401);
      }

      // 2. Change password if requested
      if (newPassword && newPassword.trim()) {
        await auth.api.changePassword({
          body: {
            currentPassword,
            newPassword: newPassword.trim(),
            revokeOtherSessions: false,
          },
          headers: headerList,
        });
      }

      // 3. Update name / email if requested
      const updates: { name?: string; email?: string } = {};
      if (newName && newName.trim()) {
        updates.name = newName.trim();
      }
      if (newEmail && newEmail.trim().toLowerCase() !== session.user.email.toLowerCase()) {
        const cleanEmail = newEmail.trim().toLowerCase();
        const existing = await prisma.user.findFirst({
          where: { email: cleanEmail, NOT: { id: session.user.id } },
        });
        if (existing) {
          return errorResponse('An account with this email address already exists.');
        }
        updates.email = cleanEmail;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: updates,
        });
      }

      return successResponse(
        { email: updates.email || session.user.email, name: updates.name || session.user.name },
        'Admin credentials updated successfully.'
      );
    }

    // Standard user password change
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid password update data.');
    }

    try {
      await auth.api.changePassword({
        body: {
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
          revokeOtherSessions: false,
        },
        headers: headerList,
      });

      return successResponse(null, 'Password updated successfully.');
    } catch (err: any) {
      return errorResponse(err?.body?.message || err?.message || 'Current password does not match.', 400);
    }
  } catch (err) {
    return serverErrorResponse(err, 'Failed to update credentials.');
  }
}
