/**
 * API Route: Get Push Status
 * GET /api/push/status
 *
 * Returns the push notification status for the current user
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getPushSubscriptionsServer } from "@/lib/db/server";
import { getDeviceId } from "@/lib/push/push-client";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { enabled: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return NextResponse.json(
        { enabled: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Get device ID from query or use default
    const deviceId = request.nextUrl.searchParams.get("deviceId") || getDeviceId();

    // Get all subscriptions for user
    const subscriptions = await getPushSubscriptionsServer(uid);

    if (!subscriptions) {
      return NextResponse.json({
        enabled: false,
        hasAnySubscriptions: false,
      });
    }

    // Check if current device has an enabled subscription
    const currentDeviceSubscription = subscriptions[deviceId];
    const currentDeviceEnabled =
      currentDeviceSubscription?.enabled === true;

    // Check if any device has enabled subscription
    const anyEnabled = Object.values(subscriptions).some((sub) => sub.enabled);

    return NextResponse.json({
      enabled: currentDeviceEnabled,
      hasAnySubscriptions: true,
      anyEnabled,
      totalDevices: Object.keys(subscriptions).length,
      enabledDevices: Object.values(subscriptions).filter((sub) => sub.enabled).length,
    });
  } catch (error) {
    console.error("[API] Error getting push status:", error);

    return NextResponse.json(
      {
        enabled: false,
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}
