import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiMusic, FiSearch, FiEdit2, FiTrash2, 
  FiPlay, FiPause, FiCalendar, FiDownload, FiUpload,
  FiHeadphones, FiDisc, FiClock, FiMoreVertical,
  FiVolume2, FiSkipBack, FiSkipForward, FiX
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';
import AudioPlayer from '../../components/common/AudioPlayer';

// Styled Components
const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-content {
    h1 {
      font-size: 1.75rem;
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: 0.5rem;
    }

    p {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${({ color }) => color}15;
    color: ${({ color }) => color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .content {
    flex: 1;

    h3 {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 2rem;

  input {
    width: 100%;
    padding: 1rem 3rem;
    border-radius: 16px;
    border: 2px solid ${({ theme }) => theme.colors.border.light};
    background: ${({ theme }) => theme.colors.background.light};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    transition: all 0.2s ease;
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.accent}15;
    }
  }

  svg {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.accent};
    font-size: 1.25rem;
  }
`;

const AlbumsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const AlbumCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${({ theme }) => theme.colors.border.light};

  .album-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border.light};

    .cover {
      width: 120px;
      height: 120px;
      border-radius: 20px;
      overflow: hidden;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .play-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          rgba(0, 0, 0, 0.4) 50%,
          rgba(0, 0, 0, 0.8) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.4s ease;

        button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${({ theme }) => theme.colors.accent};
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          transform: translateY(20px) scale(0.9);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

          &:hover {
            transform: translateY(20px) scale(1);
          }
        }
      }
    }

    .info {
      flex: 1;

      h3 {
        font-size: 1.25rem;
        color: ${({ theme }) => theme.colors.text.primary};
        margin-bottom: 0.75rem;
        font-weight: 600;
      }

      .meta {
        display: flex;
        gap: 1.5rem;
        color: ${({ theme }) => theme.colors.text.secondary};
        font-size: 0.875rem;

        span {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          svg {
            color: ${({ theme }) => theme.colors.accent};
            font-size: 1.125rem;
          }
        }
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;

      button {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        color: ${({ theme }) => theme.colors.text.secondary};
        border: 2px solid ${({ theme }) => theme.colors.border.light};
        background: ${({ theme }) => theme.colors.background.light};
        transition: all 0.3s ease;

        &:hover {
          color: ${({ theme }) => theme.colors.accent};
          border-color: ${({ theme }) => theme.colors.accent};
          transform: translateY(-2px);
        }
      }
    }
  }

  .tracks-list {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .track {
      padding: 0.875rem;
      border-radius: 12px;
      background: ${({ theme }) => theme.colors.background.medium};
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateX(-4px);
        background: ${({ theme }) => theme.colors.background.dark};

        .play-btn {
          opacity: 1;
          transform: scale(1);
        }
      }

      .number {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: ${({ theme }) => theme.colors.accent}20;
        color: ${({ theme }) => theme.colors.accent};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .track-info {
        flex: 1;
        min-width: 0;

        h4 {
          font-size: 0.95rem;
          color: ${({ theme }) => theme.colors.text.primary};
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .duration {
          font-size: 0.875rem;
          color: ${({ theme }) => theme.colors.text.secondary};
        }
      }

      .play-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.accent};
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px ${({ theme }) => theme.colors.shadow}20;
  }
`;

const StyledForm = styled(Form)`
  .cover-upload {
    width: 200px;
    height: 200px;
    margin: 0 auto 2rem;
    position: relative;
    
    .cover-preview {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      border: 3px solid ${({ theme }) => theme.colors.accent};
      overflow: hidden;
      position: relative;
      background: ${({ theme }) => theme.colors.background.medium};
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.3s ease;
      }
    }

    .upload-overlay {
      position: absolute;
      inset: 0;
      background: ${({ theme }) => theme.colors.accent}20;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.2s ease;
      cursor: pointer;

      svg {
        font-size: 2rem;
        color: ${({ theme }) => theme.colors.accent};
        margin-bottom: 0.5rem;
      }

      span {
        color: ${({ theme }) => theme.colors.accent};
        font-size: 0.875rem;
      }

      &:hover {
        opacity: 1;
      }
    }
  }

  .tracks-section {
    margin: 2rem 0;
    
    .tracks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h3 {
        font-size: 1rem;
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }

    .tracks-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .track-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: ${({ theme }) => theme.colors.background.medium};
        border-radius: 12px;
        position: relative;

        .track-number {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: ${({ theme }) => theme.colors.accent}20;
          color: ${({ theme }) => theme.colors.accent};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
        }

        .track-info {
          flex: 1;

          input {
            width: 100%;
            background: transparent;
            border: none;
            color: ${({ theme }) => theme.colors.text.primary};
            font-size: 0.875rem;
            padding: 0.25rem 0;
            border-bottom: 2px solid transparent;

            &:focus {
              outline: none;
              border-bottom-color: ${({ theme }) => theme.colors.accent};
            }
          }

          .audio-file {
            font-size: 0.75rem;
            color: ${({ theme }) => theme.colors.text.secondary};
            margin-top: 0.25rem;
          }
        }

        .track-actions {
          display: flex;
          gap: 0.5rem;

          button {
            padding: 0.5rem;
            border-radius: 8px;
            color: ${({ theme }) => theme.colors.text.secondary};
            transition: all 0.2s ease;

            &:hover {
              background: ${({ theme }) => theme.colors.background.light};
              color: ${({ theme }) => theme.colors.error};
            }
          }
        }
      }
    }
  }
`;

// Main Component
const Albums = () => {
  const theme = useTheme();
  const { show } = useNotification();
  const audioRef = useRef(null);
  
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  // Sample data
  const [albums, setAlbums] = useState([
    {
      id: '1',
      title: 'ديوان الشعر',
      cover: '/photo1.jpg',
      releaseDate: '2024-03-15',
      tracksCount: 12,
      duration: '1:24:36',
      plays: 1500,
      tracks: [
        { 
          id: '1', 
          title: 'قصيدة الحب', 
          duration: '4:32',
          audioUrl: '/track1.mp3'
        },
        { 
          id: '2', 
          title: 'نشيد الصباح', 
          duration: '3:45',
          audioUrl: '/track1.mp3'
        },
        { 
          id: '3', 
          title: 'أغنية المساء', 
          duration: '5:12',
          audioUrl: '/track1.mp3'
        },
      ]
    },
    // Add more albums...
  ]);

  const stats = [
    {
      label: 'إجمالي الألبومات',
      value: albums.length,
      icon: <FiDisc />,
      color: theme.colors.primary
    },
    {
      label: 'المقاطع الصوتية',
      value: albums.reduce((sum, album) => sum + album.tracksCount, 0),
      icon: <FiMusic />,
      color: theme.colors.success
    },
    {
      label: 'عدد الاستماع',
      value: albums.reduce((sum, album) => sum + album.plays, 0),
      icon: <FiHeadphones />,
      color: theme.colors.warning
    }
  ];

  // Handle cover image upload
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding new track
  const handleAddTrack = () => {
    const newTrack = {
      id: Date.now().toString(),
      title: '',
      file: null
    };
    setTracks(prev => [...prev, newTrack]);
  };

  // Handle track title change
  const handleTrackTitleChange = (trackId, newTitle) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, title: newTitle } : track
    ));
  };

  // Handle track file selection
  const handleTrackFileSelect = async (trackId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Get audio duration
          const duration = await getAudioDuration(file);
          
          setTracks(prev => prev.map(track => 
            track.id === trackId ? { 
              ...track, 
              file,
              duration: formatDuration(duration),
              audioUrl: URL.createObjectURL(file)
            } : track
          ));
        } catch (error) {
          show('حدث خطأ أثناء تحميل الملف', 'error');
        }
      }
    };
    
    input.click();
  };

  // Handle track removal
  const handleRemoveTrack = (trackId) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const newAlbum = {
        id: editingAlbum?.id || Date.now().toString(),
        title: formData.get('title'),
        cover: coverFile || editingAlbum?.cover || '/photo1.jpg',
        tracksCount: tracks.length,
        duration: calculateTotalDuration(tracks),
        plays: editingAlbum?.plays || 0,
        tracks: tracks.map(track => ({
          id: track.id,
          title: track.title,
          duration: track.duration || '0:00'
        }))
      };

      if (editingAlbum) {
        setAlbums(prev => prev.map(album => 
          album.id === editingAlbum.id ? newAlbum : album
        ));
        show('تم تحديث الألبوم بنجاح', 'success');
      } else {
        setAlbums(prev => [...prev, newAlbum]);
        show('تم إضافة الألبوم بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingAlbum(null);
      setCoverFile(null);
      setTracks([]);
    } catch (error) {
      show('حدث خطأ أثناء حفظ الألبوم', 'error');
    }
  };

  // Helper function to calculate total duration
  const calculateTotalDuration = (tracks) => {
    // This is a placeholder. In a real app, you'd calculate this from actual audio files
    return tracks.reduce((total, track) => {
      const [mins, secs] = (track.duration || '0:00').split(':').map(Number);
      return total + mins * 60 + secs;
    }, 0);
  };

  // Add these handlers at the top of your Albums component
  const handleEditAlbum = (album) => {
    setEditingAlbum(album);
    setTracks(album.tracks);
    setCoverFile(album.cover);
    setIsAddModalOpen(true);
  };

  const handleDeleteAlbum = (albumId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الألبوم؟')) {
      setAlbums(prev => prev.filter(album => album.id !== albumId));
      show('تم حذف الألبوم بنجاح', 'success');
    }
  };

  // Fix the play functionality by updating the handleTrackPlay function
  const handleTrackPlay = (track, album) => {
    try {
      // If same track is clicked, just toggle play/pause
      if (currentTrack?.id === track.id) {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            audioRef.current.play();
          }
          setIsPlaying(!isPlaying);
        }
        return;
      }

      // If different track, stop current and play new
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      setCurrentTrack({
        ...track,
        id: track.id,
        albumTitle: album.title,
        albumCover: album.cover
      });

      setAudioUrl(track.audioUrl);
      
      // Reset progress when changing tracks
      setProgress(0);
      
      // Play new track after a short delay
      setTimeout(() => {
        if (audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch(error => {
                console.error('Error playing audio:', error);
                show('حدث خطأ أثناء تشغيل المقطع', 'error');
                setIsPlaying(false);
              });
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error in handleTrackPlay:', error);
      show('حدث خطأ أثناء تشغيل المقطع', 'error');
    }
  };

  // Add this effect to handle audio element updates
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }
  }, [audioRef.current]);

  // Add helper functions
  const getAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      
      audio.addEventListener('error', reject);
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Add this effect for cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Add this effect to handle audio loading
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        show('حدث خطأ أثناء تشغيل المقطع', 'error');
      });
    }
  }, [audioUrl]);

  return (
    <Container>
      <PageHeader>
        <div className="header-content">
          <h1>الألبومات</h1>
          <p>إدارة وتنظيم الألبومات والمقاطع الصوتية</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة ألبوم
        </Button>
      </PageHeader>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            color={stat.color}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="icon">{stat.icon}</div>
            <div className="content">
              <h3>{stat.label}</h3>
              <div className="value">{stat.value.toLocaleString('ar-EG')}</div>
            </div>
          </StatCard>
        ))}
      </StatsGrid>

      <SearchBar>
        <FiSearch />
        <input
          type="text"
          placeholder="ابحث عن ألبوم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      <AlbumsGrid>
        {albums
          .filter(album => 
            album.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((album, index) => (
            <AlbumCard
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="album-header">
                <div className="cover">
                  <img src={album.cover} alt={album.title} />
                  <div className="play-overlay">
                    <button onClick={() => handleTrackPlay(album.tracks[0], album)}>
                      {isPlaying && currentTrack?.id === album.tracks[0].id ? <FiPause /> : <FiPlay />}
                    </button>
                  </div>
                </div>
                <div className="info">
                  <h3>{album.title}</h3>
                  <div className="meta">
                    <span>
                      <FiMusic />
                      {album.tracksCount} مقطع
                    </span>
                    <span>
                      <FiClock />
                      {album.duration}
                    </span>
                  </div>
                </div>
                <div className="actions">
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleEditAlbum(album);
                  }}>
                    <FiEdit2 />
                  </IconButton>
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(album.id);
                  }}>
                    <FiTrash2 />
                  </IconButton>
                  <IconButton>
                    <FiMoreVertical />
                  </IconButton>
                </div>
              </div>
              <div className="tracks-list">
                {album.tracks.map((track, index) => (
                  <div className="track" key={track.id}>
                    <div className="number">{index + 1}</div>
                    <div className="track-info">
                      <h4>{track.title}</h4>
                      <div className="duration">{track.duration}</div>
                    </div>
                    <button 
                      type="button"
                      className="play-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTrackPlay(track, album);
                      }}
                    >
                      {isPlaying && currentTrack?.id === track.id ? <FiPause /> : <FiPlay />}
                    </button>
                  </div>
                ))}
              </div>
            </AlbumCard>
          ))}
      </AlbumsGrid>

      <Modal
        isOpen={isAddModalOpen || editingAlbum}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAlbum(null);
          setCoverFile(null);
          setTracks([]);
        }}
        title={editingAlbum ? 'تعديل الألبوم' : 'إضافة ألبوم جديد'}
      >
        <StyledForm onSubmit={handleSubmit}>
          <div className="cover-upload">
            <div className="cover-preview">
              <img src={coverFile || editingAlbum?.cover || '/photo1.jpg'} alt="غلاف الألبوم" />
            </div>
            <label className="upload-overlay" htmlFor="cover-input">
              <FiUpload />
              <span>تحميل صورة الغلاف</span>
            </label>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              style={{ display: 'none' }}
            />
          </div>

          <FormGroup>
            <label>عنوان الألبوم</label>
            <Input
              name="title"
              defaultValue={editingAlbum?.title}
              placeholder="أدخل عنوان الألبوم"
              required
            />
          </FormGroup>

          <div className="tracks-section">
            <div className="tracks-header">
              <h3>المقاطع الصوتية</h3>
              <Button type="button" variant="secondary" onClick={handleAddTrack}>
                <FiPlus />
                إضافة مقطع
              </Button>
            </div>

            <div className="tracks-list">
              {tracks.map((track, index) => (
                <div className="track-item" key={track.id}>
                  <div className="track-number">{index + 1}</div>
                  <div className="track-info">
                    <input
                      type="text"
                      value={track.title}
                      onChange={(e) => handleTrackTitleChange(track.id, e.target.value)}
                      placeholder="عنوان المقطع"
                    />
                    <div className="audio-file">
                      {track.file ? track.file.name : 'لم يتم اختيار ملف'}
                    </div>
                  </div>
                  <div className="track-actions">
                    <IconButton 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTrackFileSelect(track.id);
                      }}
                    >
                      <FiUpload />
                    </IconButton>
                    <IconButton 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveTrack(track.id);
                      }}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-footer">
            <Button type="button" variant="secondary" onClick={() => {
              setIsAddModalOpen(false);
              setEditingAlbum(null);
            }}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {editingAlbum ? 'تحديث الألبوم' : 'إضافة الألبوم'}
            </Button>
          </div>
        </StyledForm>
      </Modal>

      <AnimatePresence>
        {currentTrack && (
          <>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => {
                setIsPlaying(false);
                setProgress(0);
              }}
              onTimeUpdate={(e) => {
                const progress = (e.target.currentTime / e.target.duration) * 100;
                setProgress(progress);
              }}
            />
            <AudioPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              progress={progress}
              onPlayPause={() => {
                if (audioRef.current) {
                  if (isPlaying) {
                    audioRef.current.pause();
                  } else {
                    audioRef.current.play().catch(error => {
                      console.error('Error playing audio:', error);
                      show('حدث خطأ أثناء تشغيل المقطع', 'error');
                    });
                  }
                  setIsPlaying(!isPlaying);
                }
              }}
              onClose={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                setCurrentTrack(null);
                setIsPlaying(false);
                setProgress(0);
              }}
            />
          </>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Albums; 