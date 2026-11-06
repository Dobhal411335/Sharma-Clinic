import { publicApiFetch } from "@/lib/api/client";

export interface NewsletterSubscribeResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
  };
}

type NewsletterTokenResult = {
  success: boolean;
  message: string;
  data?: { email: string };
};

export async function subscribeNewsletter(
  email: string,
  siteCode = "IN",
): Promise<NewsletterSubscribeResult> {
  return publicApiFetch<NewsletterSubscribeResult>(
    `/sites/${siteCode}/newsletter/subscribe`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export async function unsubscribeNewsletter(token: string): Promise<NewsletterTokenResult> {
  const query = `?token=${encodeURIComponent(token)}`;
  try {
    return await publicApiFetch<NewsletterTokenResult>(`/newsletter/unsubscribe${query}`, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch {
    return publicApiFetch<NewsletterTokenResult>(`/newsletter/unsubscribe${query}`, {
      method: "GET",
    });
  }
}
