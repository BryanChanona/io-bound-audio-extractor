export class DownloadModelAudios {
  constructor({ id, title, artist, description, duration, stream_url, permalink }) {
    this.track_id = id;
    this.title = title;
    this.artist = artist ? artist.name : 'Unknown';
    this.description = description || permalink || '';
    this.duration = duration || null;
    this.stream_url = stream_url || '';
  }
}
