
import data from './avatars.json';

export type AvatarData = {
  id: string;
  url: string;
};

export const avatars: AvatarData[] = data.avatars;
