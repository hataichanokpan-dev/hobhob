/**
 * API Route: Unregister Push Subscription
 * POST /api/push/unregister
 *
 * Disables a push subscription for a user's device
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { disablePushSubscriptionServer } from "@/lib/db/server";
import type { PushApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Missing required field: deviceId" },
        { status: 400 }
      );
    }

    // Disable subscription in database
    await disablePushSubscriptionServer(uid, deviceId);

    return NextResponse.json<PushApiResponse>({
      success: true,
      message: "Push subscription disabled successfully",
    });
  } catch (error) {
    console.error("[API] Error disabling push subscription:", error);

    return NextResponse.json<PushApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to disable subscription",
      },
      { status: 500 }
    );
  }
}
