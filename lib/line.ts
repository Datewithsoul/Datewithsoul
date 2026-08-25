async function getLineAccessToken() {
  if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    return process.env.LINE_CHANNEL_ACCESS_TOKEN;
  }
  
  const clientId = process.env.LINE_OA_CLIENT_ID;
  const clientSecret = process.env.LINE_OA_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const res = await fetch("https://api.line.me/v2/oauth/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    const data = await res.json();
    return data.access_token || null;
  } catch (error) {
    console.error("Error fetching LINE access token:", error);
    return null;
  }
}

export async function sendLineMessage(userId: string, text: string) {
  const token = await getLineAccessToken();
  if (!token) {
    console.warn("LINE_CHANNEL_ACCESS_TOKEN is missing. Cannot send LINE message.");
    return false;
  }

  if (!userId) {
    console.warn("User ID is missing. Cannot send LINE message.");
    return false;
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: text,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to send LINE message:", data);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error sending LINE message:", error);
    return false;
  }
}

export async function notifyAdmins(text: string, type: string = "ADMIN_ALERT") {
  const { prisma } = await import("@/lib/prisma");
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", lineId: { not: null } },
    select: { id: true, lineId: true, name: true },
  });

  const ids = new Set(
    admins.map((admin) => admin.lineId).filter((id): id is string => Boolean(id))
  );

  await Promise.all([...ids].map((id) => sendLineMessage(id, text)));

  // Log notifications for admins in DB
  try {
    for (const admin of admins) {
      if (admin.lineId) {
        await prisma.notificationLog.create({
          data: {
            userId: admin.id,
            type,
            message: text,
          },
        });
      }
    }
  } catch (err) {
    console.warn("Could not log admin notification:", err);
  }
}

/**
 * Send a templated LINE message to a customer, logging the notification if requested.
 */
export async function sendTemplatedLineMessage(
  lineUserId: string | null | undefined,
  templateKey: string,
  variables: Record<string, string | number | undefined | null>,
  logOptions?: {
    userId?: string;
    bookingId?: string;
    type?: string;
  }
): Promise<boolean> {
  if (!lineUserId) return false;

  const { getRenderedMessage } = await import("@/lib/message-templates");
  const { text, enabled } = await getRenderedMessage(templateKey, variables);

  if (!enabled || !text.trim()) {
    return false;
  }

  const success = await sendLineMessage(lineUserId, text);

  // DB Logging
  try {
    const { prisma } = await import("@/lib/prisma");
    let targetUserId = logOptions?.userId;

    if (!targetUserId) {
      const user = await prisma.user.findFirst({
        where: { lineId: lineUserId },
        select: { id: true },
      });
      targetUserId = user?.id;
    }

    if (targetUserId) {
      await prisma.notificationLog.create({
        data: {
          userId: targetUserId,
          bookingId: logOptions?.bookingId || null,
          type: logOptions?.type || templateKey,
          message: text,
        },
      });
    }
  } catch (err) {
    console.warn("Could not log notification:", err);
  }

  return success;
}

/**
 * Send a templated LINE notification to all administrators.
 */
export async function notifyAdminsTemplated(
  templateKey: string,
  variables: Record<string, string | number | undefined | null>
): Promise<void> {
  const { getRenderedMessage } = await import("@/lib/message-templates");
  const { text, enabled } = await getRenderedMessage(templateKey, variables);

  if (!enabled || !text.trim()) {
    return;
  }

  await notifyAdmins(text, templateKey);
}
