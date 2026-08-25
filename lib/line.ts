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

export async function notifyAdmins(text: string) {
  const { prisma } = await import("@/lib/prisma");
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", lineId: { not: null } },
    select: { lineId: true },
  });

  const ids = new Set(
    admins.map((admin) => admin.lineId).filter((id): id is string => Boolean(id))
  );

  await Promise.all([...ids].map((id) => sendLineMessage(id, text)));
}
