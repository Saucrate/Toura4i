import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiPause, FiX, FiPlus, FiFilter, 
  FiDownload, FiShare2, FiEye, FiCalendar, 
  FiClock, FiGrid, FiList, FiChevronDown, FiUpload, FiImage, FiHeart,
  FiUser, FiSearch, FiEdit2, FiTrash2, FiFolder
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, Input, TextArea, Select } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';
import videoService from '../../services/videoService';
import poetService from '../../services/poetService';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.background.light};
  padding: 0.25rem;
  border-radius: 8px;
`;

const ToggleButton = styled(IconButton)`
  color: ${({ active, theme }) => 
    active ? theme.colors.accent : theme.colors.text.secondary};
  background: ${({ active, theme }) => 
    active ? theme.colors.accent + '20' : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.accent + '10'};
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
`;

const FiltersBar = styled.div`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  overflow: hidden;
`;

const FiltersHeader = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: ${({ isOpen, theme }) => 
    isOpen ? `1px solid ${theme.colors.border.light}` : 'none'};
  cursor: pointer;

  h3 {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toggle-icon {
    margin-right: auto;
    transition: transform 0.3s ease;
    transform: rotate(${({ isOpen }) => isOpen ? '180deg' : '0deg'});
  }
`;

const ActiveFilters = styled(motion.div)`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  .badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: ${({ theme }) => theme.colors.accent + '15'};
    color: ${({ theme }) => theme.colors.accent};
    border-radius: 16px;
    font-size: 0.75rem;

    button {
      padding: 0;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      
      &:hover {
        color: ${({ theme }) => theme.colors.error};
      }
    }
  }
`;

const FiltersContent = styled(motion.div)`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.light};
`;

const FiltersInner = styled(motion.div)`
  padding: 1rem;
  display: flex;
  gap: 2rem;

  .filter-section {
    flex: 1;
    min-width: 200px;

    h4 {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
`;

const FilterChip = styled(motion.button)`
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.border.light};
  background: ${({ theme, active }) => 
    active ? theme.colors.accent + '15' : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.colors.accent};
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  .count {
    background: ${({ theme }) => theme.colors.background.medium};
    padding: 0.125rem 0.375rem;
    border-radius: 12px;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  svg {
    font-size: 1.1em;
  }
`;

const SearchInput = styled(Input)`
  background: ${({ theme }) => theme.colors.background.medium};
  border: none;
  padding: 0.75rem 1rem;
  width: 100%;
  border-radius: 8px;

  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent + '40'};
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
  direction: ltr;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}20;
  }

  &::-webkit-calendar-picker-indicator {
    filter: ${({ theme }) => theme.mode === 'dark' ? 'invert(1)' : 'none'};
    cursor: pointer;
    padding: 0.25rem;
    margin-right: -0.5rem;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
`;

const FileInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const FileInput = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  position: absolute;
  overflow: hidden;
  z-index: -1;
`;

const FileInputLabel = styled.label`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 2px dashed ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }

  .icon {
    font-size: 1.5rem;
    opacity: 0.7;
  }

  .main-text {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .sub-text {
    font-size: 0.75rem;
  }

  &.dragging {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accent}10;
  }
`;

const DateRangeFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const VideoGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;

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

const VideoCard = styled(motion.div)`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.accent};
  }

  .thumbnail {
    position: relative;
    width: 100%;
    padding-top: 56.25%; // 16:9 aspect ratio
    overflow: hidden;
    background: ${({ theme }) => theme.colors.background.dark};

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .duration {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.2s;

      svg {
        color: white;
        font-size: 2.5rem;
        transform: scale(0.9);
        transition: transform 0.2s;
      }
    }

    &:hover .play-overlay {
      opacity: 1;

      svg {
        transform: scale(1);
      }
    }
  }

  .card-content {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text.primary};
      margin: 0;
      line-height: 1.4;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 0.5rem;

      .meta-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.75rem;
        background: ${({ theme }) => theme.colors.background.light};
        border-radius: 8px;
        border: 1px solid ${({ theme }) => theme.colors.border.light};
        transition: all 0.2s ease;

        &:hover {
          background: ${({ theme }) => theme.colors.accent}10;
          border-color: ${({ theme }) => theme.colors.accent};
        }

        svg {
          color: ${({ theme }) => theme.colors.accent};
        }

      span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
          color: ${({ theme }) => theme.colors.text.secondary};
          font-size: 0.875rem;
        }

        .count {
          font-weight: 600;
          color: ${({ theme }) => theme.colors.text.primary};
        }
      }
    }

    .description {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .actions {
      margin-top: auto;
      display: flex;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid ${({ theme }) => theme.colors.border.light};

      button {
        flex: 1;
        padding: 0.75rem;
        border: none;
        background: ${({ theme }) => theme.colors.background.light};
        color: ${({ theme }) => theme.colors.text.secondary};
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;

        &:hover {
          background: ${({ theme }) => theme.colors.accent};
          color: white;
          transform: translateY(-2px);
        }

        svg {
          font-size: 1.1rem;
        }
      }
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: ${({ align }) => align || 'flex-start'};
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.dark};
`;

const VideoPreview = styled.video`
  width: 100%;
  display: block;
`;

const ThumbnailPreview = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const VideoPlayer = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(8px);

  .player-container {
    position: relative;
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    background: ${({ theme }) => theme.colors.background.dark};
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .player-header {
    padding: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;

    .thumbnail {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      object-fit: cover;
    }

    .info {
      flex: 1;
      min-width: 0;
      
      .title {
        color: ${({ theme }) => theme.colors.text.primary};
        font-weight: 500;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .meta {
        color: ${({ theme }) => theme.colors.text.secondary};
        font-size: 0.875rem;
        display: flex;
        gap: 1rem;
      }
    }

    .close-btn {
      flex-shrink: 0;
    }
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; // 16:9 aspect ratio
    background: black;
    flex: 1;

    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  // Add click handler to background
  .backdrop {
    position: absolute;
    inset: 0;
    cursor: pointer;
  }
`;

const PersonSelector = styled.div`
  .selected-person {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    border-radius: 8px;
    cursor: pointer;

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info {
      h4 {
        margin: 0;
        font-size: 0.875rem;
        color: ${({ theme }) => theme.colors.text.primary};
      }

      p {
        margin: 0;
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.text.secondary};
      }
    }

    .select-icon {
      margin-left: auto;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

const PersonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

const PersonCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 8px;
  cursor: pointer;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 0.5rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h4 {
    margin: 0;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  ${({ selected }) =>
    selected &&
    `
    background-color: ${({ theme }) => theme.colors.accent}10;
  `}
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  input {
    flex: 1;
    padding: 0.5rem;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterState, setFilterState] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    duration: '',
    date: '',
    featured: false
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isPersonSelectorOpen, setIsPersonSelectorOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  
  const { show } = useNotification();

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
    loadPersons();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoService.getAllVideos({
        category: activeFilters.category,
        search,
        featured: activeFilters.featured
      });
      setVideos(response.videos);
      setError(null);
    } catch (err) {
      setError('Error fetching videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPersons = async () => {
    try {
      const data = await poetService.getAllPoets();
      setPersons(data);
    } catch (error) {
      show('حدث خطأ أثناء تحميل الأشخاص', 'error');
    }
  };

  const stats = [
    { label: 'إجمالي المقاطع', value: videos.length },
    { label: 'المشاهدات', value: '2.5K' },
    { label: 'التفاعلات', value: '450' },
    { label: 'المدة الإجمالية', value: '3.2 ساعة' },
  ];

  const columns = [
    { 
      key: 'title', 
      label: 'العنوان',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            style={{ 
              position: 'relative',
              width: 120,
              height: 67.5,
              borderRadius: 8,
              overflow: 'hidden'
            }}
          >
            <img 
              src={item.thumbnail} 
              alt={item.title}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => handlePlay(item)}
            >
              <FiPlay size={24} />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{item.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {formatDuration(item.duration)}
            </div>
          </div>
        </div>
      )
    },
    { key: 'category', label: 'التصنيف' },
    { key: 'date', label: 'التاريخ' },
    { 
      key: 'views', 
      label: 'المشاهدات',
      render: (item) => formatNumber(item.views)
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (item) => (
        <ButtonGroup>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handlePlay(item)}
          >
            <FiPlay />
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handleLike(item)}
          >
            <FiHeart />
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handleShare(item)}
          >
            <FiShare2 />
          </Button>
        </ButtonGroup>
      )
    }
  ];

  const filterOptions = {
    categories: [
      { id: 'all', label: 'جميع التصنيفات', count: videos.length },
      { id: 'manuscripts', label: 'المخطوطات', count: videos.filter(v => v.category === 'manuscripts').length },
      { id: 'instruments', label: 'الأدوات الموسيقية', count: videos.filter(v => v.category === 'instruments').length },
      { id: 'historical', label: 'التاريخية', count: videos.filter(v => v.category === 'historical').length },
      { id: 'mosques', label: 'المساجد', count: videos.filter(v => v.category === 'mosques').length },
      { id: 'architecture', label: 'العمارة', count: videos.filter(v => v.category === 'architecture').length },
      { id: 'artifacts', label: 'الآثار', count: videos.filter(v => v.category === 'artifacts').length },
      { id: 'calligraphy', label: 'الخط العربي', count: videos.filter(v => v.category === 'calligraphy').length },
      { id: 'cultural', label: 'الثقافية', count: videos.filter(v => v.category === 'cultural').length },
      { id: 'events', label: 'الفعاليات', count: videos.filter(v => v.category === 'events').length },
      { id: 'people', label: 'الشخصيات', count: videos.filter(v => v.category === 'people').length },
      { id: 'landmarks', label: 'المعالم', count: videos.filter(v => v.category === 'landmarks').length },
      { id: 'traditions', label: 'التقاليد', count: videos.filter(v => v.category === 'traditions').length },
      { id: 'ceremonies', label: 'الاحتفالات', count: videos.filter(v => v.category === 'ceremonies').length },
      { id: 'performances', label: 'العروض', count: videos.filter(v => v.category === 'performances').length },
      { id: 'recitations', label: 'القراءات', count: videos.filter(v => v.category === 'recitations').length },
      { id: 'lectures', label: 'المحاضرات', count: videos.filter(v => v.category === 'lectures').length },
      { id: 'workshops', label: 'الورش', count: videos.filter(v => v.category === 'workshops').length },
      { id: 'documentaries', label: 'الوثائقيات', count: videos.filter(v => v.category === 'documentaries').length },
      { id: 'other', label: 'أخرى', count: videos.filter(v => v.category === 'other').length }
    ],
    duration: [
      { id: 'all', label: 'جميع المدد', icon: <FiClock /> },
      { id: 'short', label: 'أقل من 5 دقائق', icon: <FiClock /> },
      { id: 'medium', label: '5-15 دقيقة', icon: <FiClock /> },
      { id: 'long', label: 'أكثر من 15 دقيقة', icon: <FiClock /> }
    ],
    date: [
      { id: 'all', label: 'كل الوقت', icon: <FiCalendar /> },
      { id: 'today', label: 'اليوم', icon: <FiCalendar /> },
      { id: 'week', label: 'هذا الأسبوع', icon: <FiCalendar /> },
      { id: 'month', label: 'هذا الشهر', icon: <FiCalendar /> },
      { id: 'custom', label: 'تاريخ محدد', icon: <FiCalendar /> }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const videoData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        date: formData.get('date'),
        video: videoFile,
        thumbnail: thumbnailFile,
        isFeatured: formData.get('isFeatured') === 'true',
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
        metadata: {
          format: videoFile?.type,
          size: videoFile?.size,
          resolution: {
            width: 1920,
            height: 1080
          },
          bitrate: 5000,
          codec: 'h264'
        }
      };

      if (selectedPerson) {
        videoData.person = selectedPerson._id;
      }

      if (editingVideo) {
        await videoService.updateVideo(editingVideo.id, videoData);
        show('تم تحديث الفيديو بنجاح', 'success');
      } else {
        await videoService.createVideo(videoData);
        show('تمت إضافة الفيديو بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingVideo(null);
      setVideoFile(null);
      setThumbnailFile(null);
      setSelectedPerson(null);
      fetchVideos();
    } catch (error) {
      show('حدث خطأ أثناء حفظ البيانات', 'error');
      console.error('Error saving video:', error);
    }
  };

  const handleDelete = async (video) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      try {
        await videoService.deleteVideo(video.id);
      show('تم حذف الفيديو بنجاح', 'success');
        fetchVideos(); // Refresh the video list
      } catch (error) {
        show('حدث خطأ أثناء حذف الفيديو', 'error');
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    if (video.person) {
      setSelectedPerson({
        _id: video.person._id,
        name: video.person.name,
        image: video.person.image,
        bio: video.person.bio
      });
    }
    setIsAddModalOpen(true);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handlePlay = async (video) => {
    try {
      if (!video || !video._id) {
        show('Video ID bulunamadı', 'error');
        return;
      }
      
      const videoData = await videoService.getVideoById(video._id);
      setCurrentVideo(videoData);
    } catch (error) {
      console.error('Error playing video:', error);
      show('Video oynatılırken bir hata oluştu', 'error');
    }
  };

  const handleDownload = (video) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = video.video;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      show('جاري تحميل الفيديو', 'success');
    } catch (error) {
      show('حدث خطأ أثناء تحميل الفيديو', 'error');
      console.error('Download error:', error);
    }
  };

  const handleShare = (video) => {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      })
      .then(() => show('تم مشاركة الفيديو بنجاح', 'success'))
      .catch(() => show('حدث خطأ أثناء المشاركة', 'error'));
    } else {
      // Fallback: Copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => show('تم نسخ الرابط إلى الحافظة', 'success'))
        .catch(() => show('حدث خطأ أثناء نسخ الرابط', 'error'));
    }
  };

  const handleLike = async (video) => {
    try {
      await videoService.toggleLike(video.id);
      fetchVideos(); // Refresh the video list to get updated likes count
    } catch (error) {
      show('حدث خطأ أثناء الإعجاب بالفيديو', 'error');
      console.error('Error toggling like:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({ ...prev, [type]: value }));
    
    // Apply filters
    let filtered = [...videos];
    
    if (type === 'category' && value !== 'all') {
      filtered = filtered.filter(video => video.category === value);
    }
    
    if (type === 'duration') {
      filtered = filtered.filter(video => {
        const duration = video.duration || 0;
        switch(value) {
          case 'short':
            return duration < 300; // less than 5 minutes
          case 'medium':
            return duration >= 300 && duration <= 900; // 5-15 minutes
          case 'long':
            return duration > 900; // more than 15 minutes
          default:
            return true;
        }
      });
    }
    
    if (type === 'date') {
      const now = new Date();
      filtered = filtered.filter(video => {
        const videoDate = new Date(video.date);
        switch(value) {
          case 'today':
            return videoDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            return videoDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return videoDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setVideos(filtered);
  };

  const getActiveFilterLabels = () => {
    const active = [];
    
    if (activeFilters.category && activeFilters.category !== 'all') {
      const category = filterOptions.categories.find(c => c.id === activeFilters.category);
      if (category) {
        active.push({
          type: 'category',
          label: category.label
        });
      }
    }

    if (activeFilters.date && activeFilters.date !== 'all') {
      const date = filterOptions.date.find(d => d.id === activeFilters.date);
      if (date) {
        active.push({
          type: 'date',
          label: date.label
        });
      }
    }

    if (search) {
      active.push({
        type: 'search',
        label: `بحث: ${search}`
      });
    }

    return active;
  };

  const clearFilter = (type) => {
    if (type === 'search') {
      setSearch('');
    } else {
      setActiveFilters(prev => ({ ...prev, [type]: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'video' && file.type.startsWith('video/')) {
        handleVideoChange({ target: { files: [file] } });
      } else if (type === 'image' && file.type.startsWith('image/')) {
        handleThumbnailChange({ target: { files: [file] } });
      } else {
        show('نوع الملف غير مدعوم', 'error');
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title>مقاطع الفيديو</Title>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة فيديو
        </Button>
      </Header>

      <Content>
        <FiltersBar>
          <FiltersHeader 
            isOpen={isFiltersOpen}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <h3>
              <FiFilter />
              تصفية المقاطع
            </h3>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن فيديو..."
              style={{ width: '300px' }}
            />
            <FiChevronDown className="toggle-icon" />
          </FiltersHeader>

          {getActiveFilterLabels().length > 0 && (
            <ActiveFilters
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {getActiveFilterLabels().map(filter => (
                <motion.span
                  key={filter.type}
                  className="badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {filter.label}
                  <button onClick={() => clearFilter(filter.type)}>
                    <FiX size={14} />
                  </button>
                </motion.span>
              ))}
            </ActiveFilters>
          )}

          <AnimatePresence>
            {isFiltersOpen && (
              <FiltersContent
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiltersInner
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="filter-section">
                    <h4>التصنيف</h4>
                    <div className="chips">
                      {filterOptions.categories.map(category => (
                        <FilterChip
                          key={category.id}
                          active={activeFilters.category === category.id}
                          onClick={() => handleFilterChange('category', category.id)}
                        >
                          {category.label}
                          <span className="count">{category.count}</span>
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  <div className="filter-section">
                    <h4>التاريخ</h4>
                    <div className="chips">
                      {filterOptions.date.map(date => (
                        <FilterChip
                          key={date.id}
                          active={activeFilters.date === date.id}
                          onClick={() => handleFilterChange('date', date.id)}
                        >
                          {date.icon}
                          {date.label}
                        </FilterChip>
                      ))}
                    </div>
                    {activeFilters.date === 'custom' && (
                      <DateRangeFilter>
                        <DateInput
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                          placeholder="من تاريخ"
                        />
                        <DateInput
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                          placeholder="إلى تاريخ"
                        />
                      </DateRangeFilter>
                    )}
                  </div>
                </FiltersInner>
              </FiltersContent>
            )}
          </AnimatePresence>
        </FiltersBar>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
        <VideoGrid>
            {videos.map(video => (
            <VideoCard
              key={video._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <div className="thumbnail" onClick={() => handlePlay(video)}>
                <img src={video.thumbnail} alt={video.title} />
                <div className="duration">{formatDuration(video.duration)}</div>
                <div className="play-overlay">
                  <FiPlay />
              </div>
              </div>
              <div className="card-content">
                <h3 className="title">{video.title}</h3>
                <div className="meta">
                  <div className="meta-group">
                    <FiCalendar />
                    <span>{formatDate(video.date)}</span>
                </div>
                  {video.category && (
                    <div className="meta-group">
                      <FiFolder />
                      <span>{video.category}</span>
              </div>
                  )}
                  <div className="meta-group">
                    <FiEye />
                    <span>المشاهدات</span>
                    <span className="count">{video.views || 0}</span>
                  </div>
                  <div className="meta-group">
                    <FiHeart />
                    <span>الإعجابات</span>
                    <span className="count">{video.likes?.length || 0}</span>
                  </div>
                </div>
                {video.description && (
                  <p className="description">{video.description}</p>
                )}
              <div className="actions">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(video); }}>
                    <FiEdit2 />
                    تعديل
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(video); }}>
                    <FiTrash2 />
                    حذف
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handlePlay(video); }}>
                    <FiPlay />
                    تشغيل
                  </button>
                </div>
              </div>
            </VideoCard>
          ))}
        </VideoGrid>
        )}

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVideo(null);
            setSelectedPerson(null);
          }}
          title={editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو'}
        >
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label>العنوان</label>
              <Input
                name="title"
                defaultValue={editingVideo?.title}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>التصنيف</label>
              <Select
                name="category"
                defaultValue={editingVideo?.category}
                required
              >
                <option value="">اختر التصنيف</option>
                {filterOptions.categories
                  .filter(cat => cat.id !== 'all')
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))
                }
              </Select>
            </FormGroup>

            <FormGroup>
              <label>التاريخ</label>
              <DateInput
                type="date"
                name="date"
                defaultValue={editingVideo?.date}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>الوصف</label>
              <TextArea
                name="description"
                defaultValue={editingVideo?.description}
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <label>ملف الفيديو</label>
              <FileInputWrapper>
                <FileInput
                  type="file"
                  id="video-file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  required={!editingVideo}
                />
                <FileInputLabel htmlFor="video-file">
                  <FiUpload className="icon" />
                  <span className="main-text">اختر ملف الفيديو</span>
                  <span className="sub-text">أو قم بسحب وإفلات الملف هنا</span>
                </FileInputLabel>
              </FileInputWrapper>
              {videoFile && (
                <PreviewContainer>
                  <VideoPreview
                    controls
                    src={URL.createObjectURL(videoFile)}
                  />
                </PreviewContainer>
              )}
            </FormGroup>

            <FormGroup>
              <label>الصورة المصغرة</label>
              <FileInputWrapper>
                <FileInput
                  type="file"
                  id="thumbnail-file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  required={!editingVideo}
                />
                <FileInputLabel htmlFor="thumbnail-file">
                  <FiImage className="icon" />
                  <span className="main-text">اختر صورة مصغرة</span>
                  <span className="sub-text">أو قم بسحب وإفلات الصورة هنا</span>
                </FileInputLabel>
              </FileInputWrapper>
              {thumbnailFile && (
                <PreviewContainer>
                  <ThumbnailPreview
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="معاينة الصورة المصغرة"
                  />
                </PreviewContainer>
              )}
            </FormGroup>

            <FormGroup>
              <label>الشخص (اختياري)</label>
              <PersonSelector>
                <div 
                  className="selected-person"
                  onClick={() => setIsPersonSelectorOpen(true)}
                >
                  {selectedPerson ? (
                    <>
                      <div className="avatar">
                        <img src={selectedPerson.image} alt={selectedPerson.name} />
                      </div>
                      <div className="info">
                        <h4>{selectedPerson.name}</h4>
                        <p>{selectedPerson.bio}</p>
                      </div>
                      <FiEdit2 className="select-icon" />
                    </>
                  ) : (
                    <>
                      <div className="avatar">
                        <FiUser size={24} />
                      </div>
                      <div className="info">
                        <h4>اختر الشخص</h4>
                        <p>انقر لاختيار الشخص</p>
                      </div>
                      <FiChevronDown className="select-icon" />
                    </>
                  )}
                </div>
              </PersonSelector>
            </FormGroup>

            <ButtonGroup align="end">
              <Button type="submit">
                {editingVideo ? 'تحديث' : 'إضافة'}
              </Button>
            </ButtonGroup>
          </Form>
        </Modal>

        <Modal
          isOpen={isPersonSelectorOpen}
          onClose={() => setIsPersonSelectorOpen(false)}
          title="اختيار الشخص"
        >
          <SearchBar>
            <FiSearch />
            <input
              type="text"
              placeholder="ابحث عن شخص..."
              value={personSearch}
              onChange={(e) => setPersonSearch(e.target.value)}
            />
          </SearchBar>

          <PersonsGrid>
            {persons
              .filter(person => 
                person.name.toLowerCase().includes(personSearch.toLowerCase()) ||
                person.bio.toLowerCase().includes(personSearch.toLowerCase())
              )
              .map(person => (
                <PersonCard
                  key={person._id}
                  selected={selectedPerson?._id === person._id}
                  onClick={() => {
                    setSelectedPerson(person);
                    setIsPersonSelectorOpen(false);
                  }}
                >
                  <div className="avatar">
                    <img src={person.image} alt={person.name} />
                  </div>
                  <h4>{person.name}</h4>
                  <p>{person.bio}</p>
                </PersonCard>
              ))}
          </PersonsGrid>
        </Modal>

        <AnimatePresence>
          {currentVideo && (
            <VideoPlayer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Add clickable backdrop */}
              <div className="backdrop" onClick={() => setCurrentVideo(null)} />
              
              <div className="player-container">
                <div className="player-header">
                  <img 
                    src={currentVideo.thumbnail} 
                    alt={currentVideo.title}
                    className="thumbnail"
                  />
                  <div className="info">
                    <div className="title">{currentVideo.title}</div>
                    <div className="meta">
                      <span>
                        <FiEye />
                        {formatNumber(currentVideo.views)} مشاهدة
                      </span>
                      <span>
                        <FiCalendar />
                        {formatDate(currentVideo.date)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary"
                    className="close-btn"
                    onClick={() => setCurrentVideo(null)}
                  >
                    <FiX />
                  </Button>
                </div>
                <div className="video-wrapper">
                  <video 
                    controls 
                    autoPlay 
                    src={currentVideo.video}
                    poster={currentVideo.thumbnail}
                  />
                </div>
              </div>
            </VideoPlayer>
          )}
        </AnimatePresence>
      </Content>
    </Container>
  );
};

export default Videos; 