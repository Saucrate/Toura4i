import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiMusic, FiSearch, FiEdit2, FiTrash2, 
  FiPlay, FiPause, FiCalendar, FiDownload, FiUpload,
  FiHeadphones, FiDisc, FiClock, FiMoreVertical,
  FiVolume2, FiSkipBack, FiSkipForward, FiX, FiUser, FiChevronDown
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';
import AudioPlayer from '../../components/common/AudioPlayer';
import Loading from '../../components/common/Loading';
import albumService from '../../services/albumService';
import poetService from '../../services/poetService';
import { toast } from 'react-hot-toast';

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
  margin-bottom: 1rem;

  input {
    width: 100%;
    padding: 1rem 3rem;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.border.light};
    background: ${({ theme }) => theme.colors.background.light};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.95rem;
    transition: all 0.2s ease;
    outline: none;

    &:hover {
      border-color: ${({ theme }) => theme.colors.accent}50;
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.accent}15;
      background: ${({ theme }) => theme.colors.background.medium};
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.secondary};
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

        {track.uploadProgress !== undefined && (
          <div className="upload-progress">
            <progress value={track.uploadProgress} max="100" />
            <span>{track.uploadProgress}%</span>
          </div>
        )}
      }
    }
  }

  .poets-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 1rem;

    .poet-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      background: ${({ theme }) => theme.colors.background.medium};
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(-4px);
        background: ${({ theme }) => theme.colors.background.dark};
      }

      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .info {
        flex: 1;

        h4 {
          font-size: 1rem;
          color: ${({ theme }) => theme.colors.text.primary};
          margin-bottom: 0.25rem;
        }

        p {
          font-size: 0.875rem;
          color: ${({ theme }) => theme.colors.text.secondary};
        }
      }
    }
  }
`;

const PoetSelector = styled.div`
  .selected-poet {
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.border.light};
    background: ${({ theme }) => theme.colors.background.light};
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.accent}50;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid ${({ theme }) => theme.colors.accent};

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info {
      flex: 1;

      h4 {
        font-size: 0.95rem;
        color: ${({ theme }) => theme.colors.text.primary};
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.875rem;
        color: ${({ theme }) => theme.colors.text.secondary};
      }
    }

    .select-icon {
      color: ${({ theme }) => theme.colors.accent};
      font-size: 1.25rem;
    }
  }
`;

const PoetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.light};
    border-radius: 4px;
  }
`;

const PoetCard = styled.div`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.light};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }

  ${({ selected, theme }) => selected && `
    border-color: ${theme.colors.accent};
    background: ${theme.colors.accent}10;
  `}

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 1rem;
    border: 2px solid ${({ theme }) => theme.colors.accent};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h4 {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Progress bar için styled component ekleyelim
const ProgressBar = styled.div`
  width: 100%;
  margin-top: 0.5rem;
  
  progress {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.background.light};
    
    &::-webkit-progress-bar {
      background: ${({ theme }) => theme.colors.background.light};
      border-radius: 2px;
    }
    
    &::-webkit-progress-value {
      background: ${({ theme }) => theme.colors.accent};
      border-radius: 2px;
    }
  }
  
  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: 0.25rem;
    display: block;
  }
`;

// Main Component
const Albums = () => {
  const theme = useTheme();
  const { show } = useNotification();
  const audioRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState([]);
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
  const [poets, setPoets] = useState([]);
  const [selectedPoet, setSelectedPoet] = useState(null);
  const [isPoetSelectorOpen, setIsPoetSelectorOpen] = useState(false);
  const [poetSearch, setPoetSearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch albums on component mount
  useEffect(() => {
    fetchAlbums();
  }, []);

  // Fetch poets for the selector
  useEffect(() => {
    const fetchPoets = async () => {
      try {
        const data = await poetService.getAllPoets();
        setPoets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching poets:', error);
        show('حدث خطأ أثناء جلب قائمة الشعراء', 'error');
        setPoets([]);
      }
    };

    fetchPoets();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await albumService.getAllAlbums();
      console.log('Fetched albums:', response);
      setAlbums(response.albums || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      show('حدث خطأ أثناء جلب الألبومات', 'error');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

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
  const handleAddTrack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTracks([...tracks, { title: '', file: null }]);
  };

  // Handle track title change
  const handleTrackChange = (index, field, value) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setTracks(newTracks);
  };

  // Handle track file selection
  const handleTrackFileChange = async (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*,video/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          console.log('Selected file:', {
            name: file.name,
            type: file.type,
            size: file.size
          });

          let duration = 0;
          if (file.type.startsWith('audio/')) {
            duration = await getAudioDuration(file);
          } else if (file.type.startsWith('video/')) {
            duration = await getVideoDuration(file);
          }
          
          const newTracks = [...tracks];
          newTracks[index] = { 
            ...newTracks[index], 
            file, // Store the actual File object
            duration: formatDuration(duration)
          };
          setTracks(newTracks);

          // Log the updated track
          console.log('Updated track:', {
            index,
            title: newTracks[index].title,
            file: {
              name: file.name,
              type: file.type,
              size: file.size
            },
            duration: newTracks[index].duration
          });
        } catch (error) {
          console.error('Error processing media file:', error);
          toast.error('Error processing media file');
        }
      }
    };
    
    fileInput.click();
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject('Error loading video file');
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  // Handle track removal
  const handleRemoveTrack = (index) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  // Add resetForm function
  const resetForm = () => {
    setCoverFile(null);
    setTracks([]);
    setSelectedPoet(null);
    setEditingAlbum(null);
    setIsAddModalOpen(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);
    setIsUploading(true);
    try {
      if (!selectedPoet || !selectedPoet._id) {
        toast.error('Please select a poet');
        return;
      }

      const formData = new FormData();
      formData.append('title', e.target.title.value);
      formData.append('description', e.target.description.value);
      formData.append('artist', selectedPoet._id);

      // Cover image
      if (coverFile) {
        if (typeof coverFile === 'string') {
          const response = await fetch(coverFile);
          const blob = await response.blob();
          formData.append('image', blob, 'cover.jpg');
        } else {
          formData.append('image', coverFile);
        }
      }

      // Track dosyalarını ve meta verisini ekle
      const tracksData = [];
      tracks.forEach((track, index) => {
        if (track.file) {
          formData.append('trackFiles', track.file);
          tracksData.push({
            title: track.title,
            duration: track.duration || '0:00'
          });
        }
      });
      formData.append('tracks', JSON.stringify(tracksData));

      // Progress bar için state'i sıfırla
      setUploadProgress(0);

      await albumService.createAlbum(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      toast.success('Album oluşturuldu');
      fetchAlbums();
      resetForm();
      setUploadProgress(0);
      setIsUploading(false);
    } catch (error) {
      setUploadError(error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error(error.response?.data?.message || 'Yükleme sırasında hata oluştu');
    }
  };

  const handleDelete = async (album) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الألبوم؟')) {
      try {
        await albumService.deleteAlbum(album._id);
        show('تم حذف الألبوم بنجاح', 'success');
        fetchAlbums();
      } catch (error) {
        console.error('Delete album error:', error);
        show('حدث خطأ أثناء حذف الألبوم', 'error');
      }
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    // Make sure we're setting the correct artist object with _id
    if (album.artist && typeof album.artist === 'object') {
      setSelectedPoet({
        _id: album.artist._id,
        name: album.artist.name,
        image: album.artist.image,
        period: album.artist.period
      });
    }
    setCoverFile(album.image);
    // If album has tracks, set them
    if (album.tracks && Array.isArray(album.tracks)) {
      setTracks(album.tracks.map(track => ({
        id: track._id || Date.now().toString(),
        title: track.title,
        file: null, // We don't need to set the file for existing tracks
        duration: track.duration || '0:00'
      })));
    }
    setIsAddModalOpen(true);
  };

  // Fix the play functionality by updating the handleTrackPlay function
  const handleTrackPlay = (track, album) => {
    try {
      // If same track is clicked, just toggle play/pause
      if (currentTrack?.id === track._id) {
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
        id: track._id,
        albumTitle: album.title,
        albumCover: album.image
      });

      // Set the audio URL to the track's file URL
      setAudioUrl(track.file);
      
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
    if (!seconds) return '0:00';
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
      {loading ? (
        <Loading fullScreen />
      ) : (
        <>
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
                      <img src={album.image} alt={album.title} />
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
                        handleEdit(album);
                  }}>
                    <FiEdit2 />
                  </IconButton>
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                        handleDelete(album);
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
                      <div className="track" key={track._id}>
                    <div className="number">{index + 1}</div>
                    <div className="track-info">
                      <h4>{track.title}</h4>
                          <div className="duration">{formatDuration(track.duration)}</div>
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
                          {isPlaying && currentTrack?.id === track._id ? <FiPause /> : <FiPlay />}
                    </button>
                  </div>
                ))}
              </div>
            </AlbumCard>
          ))}
      </AlbumsGrid>

      <Modal
            isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAlbum(null);
          setCoverFile(null);
              setSelectedPoet(null);
        }}
        title={editingAlbum ? 'تعديل الألبوم' : 'إضافة ألبوم جديد'}
      >
        <StyledForm id="album-form" onSubmit={handleSubmit}>
          <div className="cover-upload">
            <div className="cover-preview">
                  <img src={coverFile || editingAlbum?.image || '/photo1.jpg'} alt="غلاف الألبوم" />
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

              <FormGroup>
                <label>وصف الألبوم</label>
                <TextArea
                  name="description"
                  defaultValue={editingAlbum?.description}
                  placeholder="أدخل وصف الألبوم"
                  rows={4}
                />
              </FormGroup>

              <FormGroup>
                <label>الشاعر</label>
                <PoetSelector>
                  <div 
                    className="selected-poet"
                    onClick={() => setIsPoetSelectorOpen(true)}
                  >
                    {selectedPoet ? (
                      <>
                        <div className="avatar">
                          <img src={selectedPoet.image} alt={selectedPoet.name} />
                        </div>
                        <div className="info">
                          <h4>{selectedPoet.name}</h4>
                          <p>{selectedPoet.period}</p>
                        </div>
                        <FiEdit2 className="select-icon" />
                      </>
                    ) : (
                      <>
                        <div className="avatar">
                          <FiUser size={24} />
                        </div>
                        <div className="info">
                          <h4>اختر الشاعر</h4>
                          <p>انقر للاختيار من قائمة الشعراء</p>
                        </div>
                        <FiChevronDown className="select-icon" />
                      </>
                    )}
                  </div>
                </PoetSelector>
          </FormGroup>

          <div className="tracks-section">
            <div className="tracks-header">
              <h3>المقاطع الصوتية</h3>
                  <Button onClick={handleAddTrack}>
                <FiPlus />
                إضافة مقطع
              </Button>
            </div>
            <div className="tracks-list">
              {tracks.map((track, index) => (
                    <div key={track.id || index} className="track-item">
                  <div className="track-number">{index + 1}</div>
                  <div className="track-info">
                    <input
                      type="text"
                      value={track.title}
                          onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                      placeholder="عنوان المقطع"
                    />
                        {track.file && (
                    <div className="audio-file">
                            {track.file.name} ({track.duration || '0:00'})
                    </div>
                        )}
                  </div>
                  <div className="track-actions">
                        <IconButton onClick={(e) => handleTrackFileChange(index, e)}>
                      <FiUpload />
                    </IconButton>
                        <IconButton onClick={() => handleRemoveTrack(index)}>
                      <FiTrash2 />
                    </IconButton>
                  </div>
                  {track.uploadProgress !== undefined && (
                    <ProgressBar>
                      <progress value={track.uploadProgress} max="100" />
                      <span>{track.uploadProgress}%</span>
                    </ProgressBar>
                  )}
                </div>
              ))}
            </div>
          </div>

          {uploadProgress > 0 && (
            <ProgressBar>
              <progress value={uploadProgress} max="100" />
              <span>{uploadProgress}%</span>
            </ProgressBar>
          )}

          {uploadError && (
            <div style={{ color: 'red', margin: '1rem 0' }}>
              Yükleme başarısız oldu: {uploadError.message || 'Bilinmeyen hata'}
              <Button
                variant="primary"
                onClick={() => document.getElementById('album-form').requestSubmit()}
                disabled={isUploading}
                style={{ marginLeft: 8 }}
              >
                Tekrar Dene
              </Button>
            </div>
          )}

          <div className="form-footer">
            <Button type="button" variant="secondary" onClick={() => {
              setIsAddModalOpen(false);
              setEditingAlbum(null);
                  setCoverFile(null);
                  setSelectedPoet(null);
            }}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {editingAlbum ? 'تحديث الألبوم' : 'إضافة الألبوم'}
            </Button>
          </div>
        </StyledForm>
      </Modal>

          {/* Poet Selector Modal */}
          <Modal
            isOpen={isPoetSelectorOpen}
            onClose={() => setIsPoetSelectorOpen(false)}
            title="اختيار الشاعر"
          >
            <SearchBar>
              <FiSearch />
              <input
                type="text"
                placeholder="ابحث عن شاعر..."
                value={poetSearch}
                onChange={(e) => setPoetSearch(e.target.value)}
              />
            </SearchBar>

            <PoetsGrid>
              {poets
                .filter(poet => 
                  poet.name.toLowerCase().includes(poetSearch.toLowerCase()) ||
                  poet.bio.toLowerCase().includes(poetSearch.toLowerCase())
                )
                .map(poet => (
                  <PoetCard
                    key={poet._id}
                    selected={selectedPoet?._id === poet._id}
                    onClick={() => {
                      setSelectedPoet(poet);
                      setIsPoetSelectorOpen(false);
                    }}
                  >
                    <div className="avatar">
                      <img src={poet.image} alt={poet.name} />
                    </div>
                    <h4>{poet.name}</h4>
                    <p>{poet.bio}</p>
                  </PoetCard>
                ))}
            </PoetsGrid>
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
        </>
      )}
    </Container>
  );
};

export default Albums; 