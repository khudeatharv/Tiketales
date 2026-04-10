import { Request, Response } from 'express';
import Show from '../models/Show';
import Theatre from '../models/Theatre';

export const getShowsByMovie = async (req: Request, res: Response) => {
  try {
    const shows = await Show.find({ movieId: req.params.movieId }).lean();
    
    // Populate theatre info manually because we are using custom defined `id` fields
    const showsWithTheatre = await Promise.all(shows.map(async (show) => {
      const theatre = await Theatre.findOne({ id: show.theatreId });
      return { ...show, theatre };
    }));

    res.json(showsWithTheatre);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getShowById = async (req: Request, res: Response) => {
  try {
    const show = await Show.findOne({ id: req.params.id }).lean();
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    const theatre = await Theatre.findOne({ id: show.theatreId });
    res.json({ ...show, theatre });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
