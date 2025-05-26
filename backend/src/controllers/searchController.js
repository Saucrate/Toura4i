const User = require('../models/User');
const Video = require('../models/Video');
const Poet = require('../models/Poet');
const Poem = require('../models/Poem');
const Place = require('../models/Place');
const Photo = require('../models/Photo');
const Book = require('../models/Book');
const AudioRecording = require('../models/AudioRecording');
const Album = require('../models/Album');

const searchController = {
  search: async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'يرجى إدخال نص البحث' });
      }

      // Her model için özel arama kriterleri
      const userCriteria = {
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      };

      const poetCriteria = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } },
          { period: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } }
        ]
      };

      const poemCriteria = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      };

      const bookCriteria = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      };

      const placeCriteria = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { type: { $regex: q, $options: 'i' } }
        ]
      };

      const albumCriteria = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      };

      const videoCriteria = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      };

      const audioRecordingCriteria = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { catalog: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { lyrics: { $regex: q, $options: 'i' } }
        ]
      };

      const photoCriteria = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      };

      // Tüm modellerde arama yap ve populate et
      const [users, poets, poems, books, places, albums, videos, audioRecordings, photos] = await Promise.all([
        User.find(userCriteria)
          .select('username name email avatar role followers following')
          .populate('followerUsers', 'name avatar')
          .populate('followingUsers', 'name avatar')
          .limit(5),
        
        Poet.find(poetCriteria)
          .select('name bio period location image website awards featured followers')
          .limit(5),
        
        Poem.find(poemCriteria)
          .populate('poet', 'name image')
          .select('title content poet category image audio isFeatured views likes comments createdAt')
          .limit(5),
        
        Book.find(bookCriteria)
          .populate('poet', 'name')
          .select('title poet year category description cover link views likes comments createdAt')
          .limit(5),
        
        Place.find(placeCriteria)
          .select('name location type year description media views likes comments createdAt')
          .limit(5),
        
        Album.find(albumCriteria)
          .populate('artist', 'name image')
          .select('title description image artist tracks likes playedBy comments releaseDate featured')
          .limit(5),
        
        Video.find(videoCriteria)
          .populate('person', 'name image')
          .select('title description category date location video thumbnail duration tags isFeatured views likes comments person')
          .limit(5),
        
        AudioRecording.find(audioRecordingCriteria)
          .populate('performer', 'name image')
          .select('title performer catalog category description date location file image duration lyrics isFeatured views likes comments')
          .limit(5),
        
        Photo.find(photoCriteria)
          .populate('person', 'name image')
          .select('title description category date location images tags isFeatured views likes comments person createdAt')
          .limit(5)
      ]);

      // Sonuçları birleştir
      const results = {
        users,
        poets,
        poems,
        books,
        places,
        albums,
        videos,
        audioRecordings,
        photos
      };

      console.log('Search results:', {
        users: users.length,
        poets: poets.length,
        poems: poems.length,
        books: books.length,
        places: places.length,
        albums: albums.length,
        videos: videos.length,
        audioRecordings: audioRecordings.length,
        photos: photos.length
      });

      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'حدث خطأ أثناء البحث', error: error.message });
    }
  }
};

module.exports = searchController; 