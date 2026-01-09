/**
 * API Route: Register Push Subscription
 * POST /api/push/register
 *
 * Registers or updates a push subscription for a user's device
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { savePushSubscriptionServer } from "@/lib/db/server";
import type { PushApiResponse, PushSubscriptionJSON } from "@/types";

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
    const { deviceId, subscription, userAgent } = body;

    if (!deviceId || !subscription) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Missing required fields: deviceId, subscription" },
        { status: 400 }
      );
    }

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Invalid subscription object" },
        { status: 400 }
      );
    }

    // Save subscription to database
    await savePushSubscriptionServer(uid, deviceId, {
      enabled: true,
      subscription,
      userAgent: userAgent || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json<PushApiResponse>({
      success: true,
      message: "Push subscription registered successfully",
    });
  } catch (error) {
    console.error("[API] Error registering push subscription:", error);

    return NextResponse.json<PushApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register subscription",
      },
      { status: 500 }
    );
  }
}
