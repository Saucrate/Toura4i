import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiFilter, FiDownload, FiShare2, FiPlay, FiPause, 
  FiEdit2, FiTrash2, FiMusic, FiHeadphones, FiClock, FiCalendar,
  FiMapPin, FiUser, FiUpload, FiSearch, FiChevronDown
} from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';
import Loading from '../../components/common/Loading';
import audioRecordingService from '../../services/audioRecordingService';
import poetService from '../../services/poetService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

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
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid ${({ theme }) => theme.colors.border.light};
  transition: all 0.3s ease;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
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

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ color }) => color};
    box-shadow: 0 8px 24px ${({ color }) => color}15;
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

const RecordingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const RecordingCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${({ theme }) => theme.colors.border.light};

  .cover {
    height: 160px;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
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

  .content {
    padding: 1.5rem;

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
      margin-bottom: 1rem;

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

    .description {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .actions {
    padding: 0.75rem;
    background: ${({ theme }) => theme.colors.background.medium};
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
    opacity: 0;
    transform: translateY(100%);
    transition: all 0.3s ease;

    button {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: ${({ theme }) => theme.colors.background.light};
      color: ${({ theme }) => theme.colors.text.secondary};
      border: 2px solid ${({ theme }) => theme.colors.border.light};
      transition: all 0.2s ease;

      &:hover {
        background: ${({ theme }) => theme.colors.accent};
        border-color: ${({ theme }) => theme.colors.accent};
        color: white;
        transform: translateY(-2px);
      }
    }
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 12px 24px ${({ theme }) => theme.colors.shadow}15;

    .cover img {
      transform: scale(1.1);
    }

    .play-overlay {
      opacity: 1;
    }

    .actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: ${({ align }) => align || 'flex-start'};
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 2px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.border.light};
  background: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.background.light};
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text.secondary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 1rem;
`;

const AudioPreview = styled.audio`
  width: 100%;
  margin-top: 1rem;
`;

const FilterModalContent = styled.div`
  padding: 1.5rem;
`;

const FilterForm = styled(Form)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

  .audio-preview {
  margin: 1rem 0;
    padding: 1rem;
    background: ${({ theme }) => theme.colors.background.medium};
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.border.light};

    audio {
      width: 100%;
      margin-top: 0.5rem;
  border-radius: 8px;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      margin-bottom: 0.5rem;

      svg {
        color: ${({ theme }) => theme.colors.accent};
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

const catalogs = [
  { id: 'mosque', label: 'خطب المساجد' },
  { id: 'school', label: 'دروس المدارس' },
  { id: 'university', label: 'محاضرات الجامعات' },
  { id: 'cultural', label: 'الشعر الثقافي' },
  { id: 'fusha', label: 'الشعر الفصيح' },
  { id: 'speeches', label: 'الخطابات الرسمية' },
  { id: 'interviews', label: 'المقابلات الإعلامية' }
];

const categories = [
  { id: 'khutbah', label: 'الخطب' },
  { id: 'lectures', label: 'المحاضرات' },
  { id: 'poetry', label: 'الشعر' },
  { id: 'speeches', label: 'الخطابات' },
  { id: 'interviews', label: 'المقابلات' }
];

const AudioRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    dateFrom: '',
    dateTo: '',
    performer: '',
    catalog: '',
    category: '',
    location: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [selectedPoet, setSelectedPoet] = useState(null);
  const [isPoetSelectorOpen, setIsPoetSelectorOpen] = useState(false);
  const [poets, setPoets] = useState([]);
  const [poetSearch, setPoetSearch] = useState('');
  
  const audioRef = useRef(null);
  const { show } = useNotification();

  useEffect(() => {
    fetchRecordings();
    loadPoets();
  }, []);

  const fetchRecordings = async () => {
    try {
      const data = await audioRecordingService.getAllRecordings();
      setRecordings(data);
    } catch (error) {
      show('حدث خطأ أثناء تحميل التسجيلات', 'error');
    }
  };

  const loadPoets = async () => {
    try {
      const data = await poetService.getAllPoets();
      setPoets(data);
    } catch (error) {
      show('حدث خطأ أثناء تحميل الشعراء', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      performer: selectedPoet?._id,
      catalog: formData.get('catalog'),
      category: formData.get('category'),
      description: formData.get('description'),
      date: formData.get('date'),
      location: formData.get('location'),
      lyrics: formData.get('lyrics'),
      isFeatured: formData.get('isFeatured') === 'true',
      duration: formData.get('duration')
    };

    try {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key]) {
          formDataToSend.append(key, data[key]);
        }
      });

      // Check if files are selected
      if (!imageFile) {
        show('Lütfen bir resim seçin', 'error');
        return;
      }
      if (!audioFile) {
        show('Lütfen bir ses dosyası seçin', 'error');
        return;
      }

      // Append files
      formDataToSend.append('image', imageFile);
      formDataToSend.append('file', audioFile);

      if (editingRecording) {
        await audioRecordingService.updateRecording(editingRecording._id, formDataToSend);
        show('تم تحديث التسجيل بنجاح', 'success');
      } else {
        await audioRecordingService.createRecording(formDataToSend);
        show('تمت إضافة التسجيل بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingRecording(null);
      setAudioFile(null);
      setImageFile(null);
      setPreviewImage(null);
      setPreviewAudio(null);
      setSelectedPoet(null);
      fetchRecordings();
    } catch (error) {
      console.error('Error saving recording:', error);
      show('حدث خطأ أثناء حفظ التسجيل', 'error');
    }
  };

  const handleDelete = async (recording) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التسجيل؟')) {
      try {
        await audioRecordingService.deleteRecording(recording._id);
      show('تم حذف التسجيل بنجاح', 'success');
        fetchRecordings();
      } catch (error) {
        show('حدث خطأ أثناء حذف التسجيل', 'error');
      }
    }
  };

  const handleEdit = (recording) => {
    setEditingRecording(recording);
    if (recording.performer) {
      setSelectedPoet({
        _id: recording.performer._id,
        name: recording.performer.name,
        image: recording.performer.image,
        bio: recording.performer.bio
      });
    }
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setPreviewAudio(URL.createObjectURL(file));
      
      // Create an audio element to get duration
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        // Get duration in seconds
        const duration = Math.round(audio.duration);
        // Update the duration input field
        const durationInput = document.querySelector('input[name="duration"]');
        if (durationInput) {
          durationInput.value = duration;
        }
        // Clean up
        URL.revokeObjectURL(audio.src);
      });
    }
  };

  const handlePlay = (recording) => {
    if (currentTrack?._id === recording._id) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      if (currentTrack) {
        audioRef.current.pause();
      }
      setCurrentTrack(recording);
      setAudioUrl(recording.file);
      setIsPlaying(true);
      setProgress(0);
      setTimeout(() => {
        audioRef.current.play();
      }, 100);
    }
  };

  const handleTimeUpdate = () => {
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(progress);
  };

  const handleFilter = (filterId) => {
    setActiveFilter(filterId);
    fetchRecordings();
  };

  const columns = [
    { 
      key: 'title', 
      label: 'العنوان',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={item.image} 
            alt={item.title} 
            style={{ width: 40, height: 40, borderRadius: 8 }} 
          />
          <div>
            <div style={{ fontWeight: 500 }}>{item.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.performer?.name || 'غير محدد'}</div>
          </div>
        </div>
      )
    },
    { key: 'catalog', label: 'الكatalog' },
    { key: 'category', label: 'التصنيف' },
    { key: 'date', label: 'التاريخ' },
    { key: 'location', label: 'المكان' },
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
            {isPlaying && currentTrack?._id === item._id ? <FiPause /> : <FiPlay />}
            {isPlaying && currentTrack?._id === item._id ? 'إيقاف' : 'تشغيل'}
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handleEdit(item)}
          >
            <FiEdit2 />
            تعديل
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handleDelete(item)}
          >
            <FiTrash2 />
            حذف
          </Button>
        </ButtonGroup>
      )
    }
  ];

  const handleExport = () => {
    // Implement export functionality
    const data = recordings.map(item => ({
      title: item.title,
      performer: item.performer?.name,
      poet: item.poet,
      date: item.date,
      location: item.location,
      description: item.description
    }));

    // Create CSV content
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "recordings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    show('تم تصدير البيانات بنجاح', 'success');
  };

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <PageHeader>
        <div className="header-content">
          <h1>التسجيلات الصوتية</h1>
          <p>إدارة التسجيلات الصوتية في النظام</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة تسجيل
        </Button>
      </PageHeader>

      <StatsGrid>
        <StatCard color="#4CAF50">
          <div className="icon">
            <FiMusic />
          </div>
          <div className="content">
            <h3>إجمالي التسجيلات</h3>
            <div className="value">{recordings.length}</div>
          </div>
          </StatCard>
        <StatCard color="#2196F3">
          <div className="icon">
            <FiClock />
          </div>
          <div className="content">
            <h3>إجمالي المدة</h3>
            <div className="value">
              {Math.round(recordings.reduce((acc, rec) => acc + (rec.duration || 0), 0) / 60)} دقيقة
            </div>
          </div>
        </StatCard>
        <StatCard color="#FF9800">
          <div className="icon">
            <FiHeadphones />
          </div>
          <div className="content">
            <h3>التصنيفات</h3>
            <div className="value">{categories.length}</div>
          </div>
          </StatCard>
      </StatsGrid>

      <SearchBar>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن تسجيل..."
        />
        <FiSearch />
      </SearchBar>

          <FilterBar>
        {categories.map((category) => (
              <FilterChip
            key={category.id}
            active={activeFilter === category.id}
            onClick={() => handleFilter(category.id)}
          >
            {category.label}
              </FilterChip>
            ))}
          </FilterBar>

      <RecordingsGrid>
        {recordings
          .filter(item => 
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.performer?.name.toLowerCase().includes(search.toLowerCase()) ||
            item.catalog.toLowerCase().includes(search.toLowerCase())
          )
          .map((recording) => (
            <RecordingCard
              key={recording._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="cover">
                <img src={recording.image} alt={recording.title} />
                <div className="play-overlay">
                  <button onClick={() => handlePlay(recording)}>
                    {isPlaying && currentTrack?._id === recording._id ? <FiPause /> : <FiPlay />}
                  </button>
        </div>
              </div>
              <div className="content">
                <h3>{recording.title}</h3>
                <div className="meta">
                  <span>
                    <FiUser />
                    {recording.performer?.name || 'غير محدد'}
                  </span>
                  <span>
                    <FiCalendar />
                    {new Date(recording.date).toLocaleDateString('ar-SA')}
                  </span>
                  <span>
                    <FiMapPin />
                    {recording.location}
                  </span>
                </div>
                <div className="description">{recording.description}</div>
              </div>
              <div className="actions">
                <button onClick={() => handleEdit(recording)}>
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(recording)}>
                  <FiTrash2 />
                </button>
                <button onClick={() => window.open(recording.file, '_blank')}>
                  <FiDownload />
                </button>
        </div>
            </RecordingCard>
          ))}
      </RecordingsGrid>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecording(null);
          setPreviewImage(null);
          setPreviewAudio(null);
        }}
        title={editingRecording ? 'تعديل التسجيل' : 'إضافة تسجيل'}
      >
        <StyledForm onSubmit={handleSubmit}>
          <div className="cover-upload">
            <div className="cover-preview">
              <img src={previewImage || editingRecording?.image || '/photo1.jpg'} alt="صورة التسجيل" />
            </div>
            <label className="upload-overlay" htmlFor="image-input">
              <FiUpload />
              <span>تحميل الصورة</span>
            </label>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          <FormGroup>
            <Input
              name="title"
              defaultValue={editingRecording?.title}
              required
              placeholder="عنوان التسجيل"
            />
            <FormGroup>
              <label>المؤدي (اختياري)</label>
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
                        <p>{selectedPoet.bio}</p>
                      </div>
                      <FiEdit2 className="select-icon" />
                    </>
                  ) : (
                    <>
                      <div className="avatar">
                        <FiUser size={24} />
                      </div>
                      <div className="info">
                        <h4>اختر المؤدي</h4>
                        <p>انقر لاختيار المؤدي</p>
                      </div>
                      <FiChevronDown className="select-icon" />
                    </>
                  )}
                </div>
              </PoetSelector>
            </FormGroup>
            <select
              name="catalog"
              defaultValue={editingRecording?.catalog}
              required
            >
              <option value="">اختر الكatalog</option>
              {catalogs.map(catalog => (
                <option key={catalog.id} value={catalog.id}>
                  {catalog.label}
                </option>
              ))}
            </select>
            <select
              name="category"
              defaultValue={editingRecording?.category}
              required
            >
              <option value="">اختر التصنيف</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <Input
              type="date"
              name="date"
              defaultValue={editingRecording?.date}
              required
            />
            <Input
              name="location"
              defaultValue={editingRecording?.location}
              required
              placeholder="المكان"
            />
            <Input
              type="hidden"
              name="duration"
              value={editingRecording?.duration || 0}
            />
            <TextArea
              name="description"
              defaultValue={editingRecording?.description}
              rows={3}
              placeholder="وصف التسجيل"
            />
          </FormGroup>

          <FormGroup>
            <label>كلمات التسجيل</label>
            <TextArea
              name="lyrics"
              defaultValue={editingRecording?.lyrics}
              rows={5}
              dir="rtl"
              placeholder="كلمات التسجيل"
            />
          </FormGroup>

          <FormGroup>
            <label>الملف الصوتي</label>
            <div className="audio-preview">
              {(previewAudio || editingRecording?.file) && (
                <>
                  <div className="file-info">
                    <FiMusic />
                    {audioFile?.name || 'ملف صوتي'}
                  </div>
                  <audio controls src={previewAudio || editingRecording?.file} />
                </>
              )}
              <label className="upload-overlay" htmlFor="audio-input">
                <FiUpload />
                <span>تحميل الملف الصوتي</span>
              </label>
              <input
                id="audio-input"
              type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                style={{ display: 'none' }}
              />
            </div>
          </FormGroup>

          <FormGroup>
            <label>
            <Input
                type="checkbox"
                name="isFeatured"
                defaultChecked={editingRecording?.isFeatured}
              />
              مميز
            </label>
          </FormGroup>

          <ButtonGroup align="end">
            <Button type="submit">
              {editingRecording ? 'تحديث' : 'إضافة'}
            </Button>
          </ButtonGroup>
        </StyledForm>
      </Modal>

      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="تصفية التسجيلات"
      >
        <FilterModalContent>
          <FilterForm>
            <FormGroup>
              <label>من تاريخ</label>
              <Input
                type="date"
                value={filterOptions.dateFrom}
                onChange={(e) => setFilterOptions({ ...filterOptions, dateFrom: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>إلى تاريخ</label>
              <Input
                type="date"
                value={filterOptions.dateTo}
                onChange={(e) => setFilterOptions({ ...filterOptions, dateTo: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>المؤدي</label>
              <Input
                value={filterOptions.performer}
                onChange={(e) => setFilterOptions({ ...filterOptions, performer: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>الكatalog</label>
              <select
                value={filterOptions.catalog}
                onChange={(e) => setFilterOptions({ ...filterOptions, catalog: e.target.value })}
              >
                <option value="">الكل</option>
                {catalogs.map(catalog => (
                  <option key={catalog.id} value={catalog.id}>
                    {catalog.label}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup>
              <label>التصنيف</label>
              <select
                value={filterOptions.category}
                onChange={(e) => setFilterOptions({ ...filterOptions, category: e.target.value })}
              >
                <option value="">الكل</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup>
              <label>المكان</label>
              <Input
                value={filterOptions.location}
                onChange={(e) => setFilterOptions({ ...filterOptions, location: e.target.value })}
              />
            </FormGroup>
          </FilterForm>
          <ButtonGroup align="end" style={{ marginTop: '1.5rem' }}>
            <Button onClick={() => setShowFilterModal(false)}>إلغاء</Button>
            <Button onClick={() => {
              // Implement filter logic here
              setShowFilterModal(false);
            }}>
              تطبيق
            </Button>
          </ButtonGroup>
        </FilterModalContent>
      </Modal>

      <Modal
        isOpen={isPoetSelectorOpen}
        onClose={() => setIsPoetSelectorOpen(false)}
        title="اختيار المؤدي"
      >
        <SearchBar>
          <FiSearch />
          <input
            type="text"
            placeholder="ابحث عن مؤدي..."
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

            <audio
              ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                setIsPlaying(false);
                setProgress(0);
              }}
      />
    </Container>
  );
};

export default AudioRecordings; 