const Urls = {};

if (process.env.NODE_ENV === 'production') {
  Urls.api = 'http://localhost:5000'; // can be different than Dev if needed
  Urls.owncloud = 'http://localhost:3001/login?user=admin';
  Urls.music = 'http://localhost:6680/musicbox_webclient';
  Urls.wiki = 'http://localhost:3003';
} else if (process.env.NODE_ENV === 'development') {
  Urls.api = 'http://localhost:5000';
  Urls.owncloud = 'http://localhost:3001/login?user=admin';
  Urls.music = 'http://localhost:6680/musicbox_webclient';
  Urls.wiki = 'http://localhost:3003';
}

export default Urls;
