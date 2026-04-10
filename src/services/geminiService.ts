export const getMovieRecommendation = async (genre: string) => {
  const response = await fetch('/movies/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genre }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch movie recommendations');
  }

  const data = (await response.json()) as { recommendations?: string };
  return data.recommendations ?? '';
};
