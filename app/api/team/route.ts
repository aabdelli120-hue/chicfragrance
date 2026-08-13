import { NextResponse } from "next/server";
import {
  createInvitation,
  listTeamMembers,
  setMemberStatus,
  updateMemberPermissions,
} from "@/lib/platform/team";
import {
  AuthError,
  authErrorResponse,
  requireOrganizationContext,
  requirePermission,
} from "@/lib/platform/session";
import type { Permission } from "@/lib/platform/permissions";
import type { PlatformRole } from "@/lib/platform/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requirePermission("team.view");
    const { organizationId } = await requireOrganizationContext();
    const data = await listTeamMembers(organizationId);
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission(["team.create"]);
    const { organizationId } = await requireOrganizationContext();
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      role?: Exclude<PlatformRole, "PLATFORM_ADMIN">;
      permissions?: Permission[];
    };

    if (!body.name || !body.email || !body.role) {
      throw new AuthError("VALIDATION", "Nom, email et rôle requis.", 400);
    }

    const result = await createInvitation({
      organizationId,
      invitedBy: session.user.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      permissions: body.permissions,
    });

    return NextResponse.json({
      ok: true,
      invitation: {
        id: result.invitation.id,
        email: result.invitation.email,
        name: result.invitation.name,
        role: result.invitation.role,
        status: result.invitation.status,
        permissions: result.invitation.permissions,
      },
      devInvitePath: result.devInvitePath,
    });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requirePermission("team.edit");
    const { organizationId } = await requireOrganizationContext();
    const body = (await request.json()) as {
      memberId?: string;
      permissions?: Permission[];
      role?: Exclude<PlatformRole, "PLATFORM_ADMIN">;
      status?: "active" | "suspended";
    };

    if (!body.memberId) {
      throw new AuthError("VALIDATION", "memberId requis.", 400);
    }

    if (body.status) {
      await setMemberStatus({
        organizationId,
        actorId: session.user.id,
        memberId: body.memberId,
        status: body.status,
      });
    }

    if (body.permissions || body.role) {
      await updateMemberPermissions({
        organizationId,
        actorId: session.user.id,
        memberId: body.memberId,
        permissions: body.permissions ?? [],
        role: body.role,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
