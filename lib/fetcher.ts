export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const data = await res.json().catch(() => ({}));
    (error as any).info = data;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};
