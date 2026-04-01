import { NextResponse } from "next/server";
import { getFirebaseAdminMessaging } from "@/lib/firebaseAdmin";

type NotificationRequest = {
  token?: string;
  title?: string;
  body?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as NotificationRequest;

    if (!payload.token || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: "token, title and body are required." },
        { status: 400 },
      );
    }

    const messaging = getFirebaseAdminMessaging();
    const messageId = await messaging.send({
      token: payload.token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      webpush: {
        notification: {
          icon: "/favicon.ico",
        },
      },
    });

    return NextResponse.json({ messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification send failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}