import api from './api';

export const getMovieRecommendation = async (genre: string) => {
  const response = await api.post('/movies/recommendations', { genre });
  return (response.data as { recommendations?: string }).recommendations ?? '';
};
