import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiPause, FiX, FiPlus, FiFilter, 
  FiDownload, FiShare2, FiEye, FiCalendar, 
  FiClock, FiGrid, FiList, FiChevronDown, FiUpload, FiImage 
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, Input, TextArea, Select } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';

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
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  .thumbnail {
    position: relative;
    aspect-ratio: 16/9;
    background: ${({ theme }) => theme.colors.background.dark};
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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

  .info {
    padding: 0.75rem;

    h3 {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      color: ${({ theme }) => theme.colors.text.primary};
    }

    .meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.text.secondary};

      span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
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

const Videos = () => {
  const [videos, setVideos] = useState([
    {
      id: '1',
      title: 'أمسية شعرية',
      description: 'أمسية شعرية مع كبار الشعراء',
      category: 'المدح والتراث',
      date: '2024-03-20',
      video: '/video2.mp4',
      thumbnail: '/photo1.jpg',
    },
  ]);

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
    date: ''
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  
  const { show } = useNotification();

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
            تشغيل
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handleDownload(item)}
          >
            <FiDownload />
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
      { id: 'madh', label: 'المدح والتراث', count: 12 },
      { id: 'poets', label: 'الشعراء والمنشدون', count: 8 },
      { id: 'events', label: 'المناسبات', count: 5 }
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
      const newVideo = {
        id: Date.now().toString(),
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        date: formData.get('date'),
        video: videoFile,
        thumbnail: thumbnailFile,
      };

      if (editingVideo) {
        setVideos(prev => prev.map(v => v.id === editingVideo.id ? newVideo : v));
        show('تم تحديث الفيديو بنجاح', 'success');
      } else {
        setVideos(prev => [...prev, newVideo]);
        show('تمت إضافة الفيديو بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingVideo(null);
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (error) {
      show('حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  const handleDelete = (video) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      setVideos(prev => prev.filter(v => v.id !== video.id));
      show('تم حذف الفيديو بنجاح', 'success');
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setIsAddModalOpen(true);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(URL.createObjectURL(file));
    }
  };

  const handlePlay = (video) => {
    setCurrentVideo(video);
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

        <VideoGrid>
          {videos.filter(video => 
            video.title.includes(search) &&
            (!selectedCategory || video.category === selectedCategory)
          ).map(video => (
            <VideoCard
              key={video.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="thumbnail">
                <img src={video.thumbnail} alt={video.title} />
              </div>
              <div className="info">
                <h3>{video.title}</h3>
                <div className="meta">
                  <span>
                    <FiEye />
                    {formatNumber(video.views)} مشاهدة
                  </span>
                  <span>
                    <FiCalendar />
                    {formatDate(video.date)}
                  </span>
                </div>
              </div>
              <div className="actions">
                <ButtonGroup>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => handlePlay(video)}
                  >
                    <FiPlay />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => handleDownload(video)}
                  >
                    <FiDownload />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => handleShare(video)}
                  >
                    <FiShare2 />
                  </Button>
                </ButtonGroup>
              </div>
            </VideoCard>
          ))}
        </VideoGrid>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVideo(null);
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
              {(videoFile || editingVideo?.video) && (
                <PreviewContainer>
                  <VideoPreview
                    controls
                    src={videoFile || editingVideo?.video}
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
              {(thumbnailFile || editingVideo?.thumbnail) && (
                <PreviewContainer>
                  <ThumbnailPreview
                    src={thumbnailFile || editingVideo?.thumbnail}
                    alt="معاينة الصورة المصغرة"
                  />
                </PreviewContainer>
              )}
            </FormGroup>

            <ButtonGroup align="end">
              <Button type="submit">
                {editingVideo ? 'تحديث' : 'إضافة'}
              </Button>
            </ButtonGroup>
          </Form>
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