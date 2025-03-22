import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiFilter, FiDownload, FiShare2, FiBook, 
  FiCalendar, FiX, FiPlay, FiPause, FiUser,
  FiGrid, FiList, FiChevronDown, FiFolder, FiHeart,
  FiEye, FiEdit2, FiTrash2, FiArrowRight, FiMessageCircle,
  FiUpload, FiFileText, FiSettings, FiSearch
} from 'react-icons/fi';
import { Button, ButtonGroup, IconButton } from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea, Select } from '../../components/common/Form';
import SearchAndFilter from '../../components/common/SearchAndFilter';
import { useNotification } from '../../components/common/Notification';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
`;

const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`;

const AudioPreview = styled.audio`
  width: 100%;
  margin-top: 1rem;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const PoemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const SearchSection = styled.div`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: 1.5rem;
  margin-bottom: 2rem;

  .search-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    .search-input {
      flex: 1;
      position: relative;

      input {
        padding: 1rem 3rem;
        border-radius: 16px;
        border: 2px solid ${({ theme }) => theme.colors.border.light};
        background: ${({ theme }) => theme.colors.background.light};
        color: ${({ theme }) => theme.colors.text.primary};
        font-size: 1rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
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

      .search-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: ${({ theme }) => theme.colors.accent};
        font-size: 1.25rem;
      }
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      background: ${({ theme }) => theme.colors.background.medium};
      border-radius: 12px;
      border: 1px solid ${({ theme }) => theme.colors.border.light};
    }
  }

  .filters-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    .filter-group {
      min-width: 200px;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        color: ${({ theme }) => theme.colors.text.secondary};
        font-size: 0.875rem;
      }

      select {
        padding: 0.875rem 2.5rem 0.875rem 1rem;
        border-radius: 12px;
        border: 2px solid ${({ theme }) => theme.colors.border.light};
        background: ${({ theme }) => theme.colors.background.light};
        color: ${({ theme }) => theme.colors.text.primary};
        font-size: 0.95rem;
        transition: all 0.2s ease;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: left 1rem center;
        background-size: 1rem;

        &:hover {
          border-color: ${({ theme }) => theme.colors.accent}50;
        }

        &:focus {
          border-color: ${({ theme }) => theme.colors.accent};
          box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.accent}15;
          background-color: ${({ theme }) => theme.colors.background.medium};
        }
      }
    }
  }
`;

const PoemCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 4px 20px -2px ${({ theme }) => theme.colors.shadow}20;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .poem-header {
    padding: 1.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: ${({ theme }) => theme.colors.background.medium};

    .poet-avatar {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      object-fit: cover;
      border: 3px solid ${({ theme }) => theme.colors.accent};
      box-shadow: 0 8px 16px ${({ theme }) => theme.colors.accent}20;
    }

    .info {
      flex: 1;

      h3 {
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
        color: ${({ theme }) => theme.colors.text.primary};
        font-weight: 600;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        color: ${({ theme }) => theme.colors.text.secondary};

        span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;

          svg {
            color: ${({ theme }) => theme.colors.accent};
          }
        }

        .category {
          padding: 0.35rem 1rem;
          background: ${({ theme }) => theme.colors.accent}15;
          color: ${({ theme }) => theme.colors.accent};
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
        }
      }
    }
  }

  .poem-content {
    padding: 2rem;
    font-family: 'Noto Naskh Arabic', serif;
    text-align: center;
    line-height: 2;
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.text.primary};
    height: 200px;
    overflow: hidden;
    position: relative;
    background: ${({ theme }) => theme.colors.background.light};
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100px;
      background: linear-gradient(transparent, ${({ theme }) => theme.colors.background.light} 90%);
    }
  }

  .poem-footer {
    padding: 1.5rem;
    background: ${({ theme }) => theme.colors.background.medium};
    display: flex;
    align-items: center;
    gap: 1rem;

    .audio-player {
      flex: 1;
      height: 44px;
      border-radius: 22px;
      overflow: hidden;
      background: ${({ theme }) => theme.colors.background.light};
      border: 2px solid ${({ theme }) => theme.colors.accent}30;

      &::-webkit-media-controls-panel {
        background: ${({ theme }) => theme.colors.background.light};
      }

      &::-webkit-media-controls-play-button {
        background-color: ${({ theme }) => theme.colors.accent};
        border-radius: 50%;
        transform: scale(1.5);
      }

      &::-webkit-media-controls-current-time-display,
      &::-webkit-media-controls-time-remaining-display {
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }

    .actions {
      display: flex;
      gap: 0.75rem;

      button {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: ${({ theme }) => theme.colors.background.light};
        border: 2px solid ${({ theme }) => theme.colors.border.light};
        color: ${({ theme }) => theme.colors.text.secondary};
        transition: all 0.2s ease;
        
        &:hover {
          background: ${({ theme }) => theme.colors.accent};
          border-color: ${({ theme }) => theme.colors.accent};
          color: white;
          transform: translateY(-2px);
        }
      }
    }
  }

  &:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 20px 40px -12px ${({ theme }) => theme.colors.accent}25;

    .poet-avatar {
      transform: scale(1.05);
      border-color: ${({ theme }) => theme.colors.accent};
    }

    .poem-header {
      border-bottom-color: ${({ theme }) => theme.colors.accent}30;
    }
  }
`;

const ViewerOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .viewer-content {
    background: ${({ theme }) => theme.colors.background.light};
    border-radius: 20px;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 1;
    }

    .poem-text {
      padding: 3rem;
      font-family: 'Noto Naskh Arabic', serif;
      text-align: center;
      line-height: 2;
      font-size: 1.25rem;
      white-space: pre-wrap;
    }

    .poem-meta {
      padding: 1.5rem 3rem;
      border-top: 1px solid ${({ theme }) => theme.colors.border.light};
      display: flex;
      align-items: center;
      justify-content: space-between;

      .poet {
        display: flex;
        align-items: center;
        gap: 1rem;

        img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }
      }

      .stats {
        display: flex;
        gap: 2rem;
        font-size: 0.875rem;
        color: ${({ theme }) => theme.colors.text.secondary};

        span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatsCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ color }) => color};
  }

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${({ color }) => color + '15'};
    color: ${({ color }) => color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .content {
    flex: 1;

    h3 {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: 0.5rem;
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: ${({ trend, theme }) => 
        trend > 0 ? theme.colors.success : theme.colors.error};

      svg {
        transform: ${({ trend }) => 
          trend > 0 ? 'rotate(-45deg)' : 'rotate(45deg)'};
      }
    }
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  button {
    flex: 1;
    padding: 1rem;
    background: ${({ theme }) => theme.colors.background.light};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
    transition: all 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.background.medium};
      transform: translateY(-2px);
    }

    svg {
      font-size: 1.25rem;
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StyledForm = styled(Form)`
  .form-header {
    margin-bottom: 2rem;
    text-align: center;

    .upload-avatar {
      width: 120px;
      height: 120px;
      border-radius: 30px;
      margin: 0 auto 1rem;
      background: ${({ theme }) => theme.colors.background.medium};
      border: 3px solid ${({ theme }) => theme.colors.accent};
      overflow: hidden;
      position: relative;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .upload-icon {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      &:hover .upload-icon {
        opacity: 1;
      }
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  input, select, textarea {
    padding: 0.875rem 1rem;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.border.light};
    background: ${({ theme }) => theme.colors.background.light};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.95rem;
    transition: all 0.2s ease;
    width: 100%;
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

  textarea {
    min-height: 120px;
    line-height: 1.6;
    resize: vertical;
  }

  select {
    cursor: pointer;
    appearance: none;
    padding-right: 2.5rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: left 1rem center;
    background-size: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
    font-weight: 500;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  input[type="file"] {
    padding: 0.75rem;
    background: ${({ theme }) => theme.colors.background.medium};
    cursor: pointer;

    &::file-selector-button {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: none;
      background: ${({ theme }) => theme.colors.accent};
      color: white;
      font-size: 0.875rem;
      cursor: pointer;
      margin-left: 1rem;
      transition: all 0.2s ease;

      &:hover {
        background: ${({ theme }) => theme.colors.accent}dd;
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

const Poems = () => {
  const theme = useTheme();
  const { show } = useNotification();

  const [poems, setPoems] = useState([
    {
      id: '1',
      title: 'عنوان القصيدة',
      content: `قصيدة جميلة تحكي عن الحب والحياة
      وكيف أن الجمال يكمن في التفاصيل الصغيرة
      وكيف أن الحب يجعل الحياة أجمل
      وكيف أن الشعر يعبر عن المشاعر`,
      poet: {
        id: '1',
        name: 'اسم الشاعر',
        image: '/photo1.jpg'
      },
      audio: '/track1.mp3',
      category: 'غزل',
      date: '2024-03-15',
      views: 1200,
      likes: 350
    }
  ]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPoem, setEditingPoem] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [poets, setPoets] = useState([
    {
      id: '1',
      name: 'اسم الشاعر',
      image: '/poet1.jpg'
    },
    // Add more poets...
  ]);
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPoem, setCurrentPoem] = useState(null);
  const [isPlaying, setIsPlaying] = useState({});
  const [filters, setFilters] = useState({
    category: '',
    poet: '',
    date: ''
  });

  const [isPoetSelectorOpen, setIsPoetSelectorOpen] = useState(false);
  const [selectedPoet, setSelectedPoet] = useState(null);
  const [poetSearch, setPoetSearch] = useState('');

  const columns = [
    { key: 'title', label: 'العنوان' },
    { 
      key: 'poet', 
      label: 'الشاعر',
      render: (item) => item.poet.name
    },
    { key: 'category', label: 'التصنيف' },
    { 
      key: 'audio', 
      label: 'المقطع الصوتي',
      render: (item) => item.audio ? 'متوفر' : 'غير متوفر'
    },
  ];

  const filterOptions = [
    {
      key: 'category',
      label: 'التصنيف',
      value: filters.category,
      options: [
        { value: 'مدح', label: 'مدح' },
        { value: 'حكمة', label: 'حكمة' },
        { value: 'غزل', label: 'غزل' },
      ],
    },
    {
      key: 'poet',
      label: 'الشاعر',
      value: filters.poet,
      options: poets.map(poet => ({
        value: poet.id,
        label: poet.name
      }))
    },
    {
      key: 'date',
      label: 'التاريخ',
      value: filters.date,
      options: [
        { value: 'all', label: 'الكل' },
        { value: 'today', label: 'اليوم' },
        { value: 'week', label: 'هذا الأسبوع' },
        { value: 'month', label: 'هذا الشهر' },
        { value: 'year', label: 'هذا العام' }
      ]
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const selectedPoetId = formData.get('poet');
      const selectedPoet = poets.find(p => p.id === selectedPoetId);

      const newPoem = {
        id: Date.now().toString(),
        title: formData.get('title'),
        poet: selectedPoet,
        category: formData.get('category'),
        description: formData.get('description'),
        audio: audioFile,
        image: imageFile,
        date: new Date().toISOString().split('T')[0],
        views: 0,
        likes: 0
      };

      if (editingPoem) {
        setPoems(prev => prev.map(p => p.id === editingPoem.id ? newPoem : p));
        show('تم تحديث القصيدة بنجاح', 'success');
      } else {
        setPoems(prev => [...prev, newPoem]);
        show('تمت إضافة القصيدة بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingPoem(null);
      setAudioFile(null);
      setImageFile(null);
    } catch (error) {
      show('حدث خطأ أثناء حفظ القصيدة', 'error');
    }
  };

  const handleDelete = (poem) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القصيدة؟')) {
      setPoems(prev => prev.filter(p => p.id !== poem.id));
      show('تم حذف القصيدة بنجاح', 'success');
    }
  };

  const handleEdit = (poem) => {
    setEditingPoem(poem);
    setIsAddModalOpen(true);
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
    }
  };

  const stats = [
    {
      label: 'إجمالي القصائد',
      value: poems.length,
      icon: <FiBook />,
      color: theme.colors.primary,
      trend: 12
    },
    {
      label: 'المشاهدات',
      value: poems.reduce((sum, poem) => sum + poem.views, 0),
      icon: <FiEye />,
      color: theme.colors.success,
      trend: 8
    },
    {
      label: 'الإعجابات',
      value: poems.reduce((sum, poem) => sum + poem.likes, 0),
      icon: <FiHeart />,
      color: theme.colors.error,
      trend: -3
    },
    {
      label: 'التعليقات',
      value: poems.reduce((sum, poem) => sum + (poem.comments?.length || 0), 0),
      icon: <FiMessageCircle />,
      color: theme.colors.warning,
      trend: 15
    }
  ];

  const filterByDate = (poemDate, filterValue) => {
    const date = new Date(poemDate);
    const now = new Date();
    
    switch (filterValue) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return date >= weekAgo;
      case 'month':
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      case 'year':
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const exportPoems = async () => {
    try {
      const data = JSON.stringify(poems, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poems-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      show('تم تصدير القصائد بنجاح', 'success');
    } catch (error) {
      show('حدث خطأ أثناء تصدير القصائد', 'error');
    }
  };

  const importPoems = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        const text = await file.text();
        const importedPoems = JSON.parse(text);
        setPoems(prev => [...prev, ...importedPoems]);
        show('تم استيراد القصائد بنجاح', 'success');
      } catch (error) {
        show('حدث خطأ أثناء استيراد القصائد', 'error');
      }
    };
    input.click();
  };

  const generateReport = () => {
    try {
      const report = {
        totalPoems: poems.length,
        totalViews: poems.reduce((sum, poem) => sum + poem.views, 0),
        totalLikes: poems.reduce((sum, poem) => sum + poem.likes, 0),
        byCategory: poems.reduce((acc, poem) => {
          acc[poem.category] = (acc[poem.category] || 0) + 1;
          return acc;
        }, {}),
        byPoet: poems.reduce((acc, poem) => {
          acc[poem.poet.name] = (acc[poem.poet.name] || 0) + 1;
          return acc;
        }, {}),
        mostViewed: [...poems].sort((a, b) => b.views - a.views).slice(0, 5),
        mostLiked: [...poems].sort((a, b) => b.likes - a.likes).slice(0, 5),
        dateRange: {
          start: new Date(Math.min(...poems.map(p => new Date(p.date)))).toLocaleDateString('ar-EG'),
          end: new Date(Math.max(...poems.map(p => new Date(p.date)))).toLocaleDateString('ar-EG')
        }
      };

      const reportText = `
تقرير القصائد
=============
إجمالي القصائد: ${report.totalPoems}
إجمالي المشاهدات: ${report.totalViews}
إجمالي الإعجابات: ${report.totalLikes}

التصنيفات:
${Object.entries(report.byCategory)
  .map(([cat, count]) => `- ${cat}: ${count}`)
  .join('\n')}

الشعراء:
${Object.entries(report.byPoet)
  .map(([poet, count]) => `- ${poet}: ${count}`)
  .join('\n')}

الأكثر مشاهدة:
${report.mostViewed
  .map((p, i) => `${i + 1}. ${p.title} (${p.views} مشاهدة)`)
  .join('\n')}

الأكثر إعجاباً:
${report.mostLiked
  .map((p, i) => `${i + 1}. ${p.title} (${p.likes} إعجاب)`)
  .join('\n')}

الفترة الزمنية: ${report.dateRange.start} - ${report.dateRange.end}
      `.trim();

      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poems-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      show('تم إنشاء التقرير بنجاح', 'success');
    } catch (error) {
      show('حدث خطأ أثناء إنشاء التقرير', 'error');
    }
  };

  const openSettings = () => {
    // You can implement settings modal here
    show('قريباً - إعدادات القصائد', 'info');
  };

  return (
    <Container>
      <PageHeader>
        <div>
          <Title>القصائد</Title>
          <Subtitle>إدارة وعرض القصائد والمقاطع الصوتية</Subtitle>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة قصيدة
        </Button>
      </PageHeader>

      <StatsSection>
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.label}
            color={stat.color}
            trend={stat.trend}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="icon">{stat.icon}</div>
            <div className="content">
              <h3>{stat.label}</h3>
              <div className="value">{stat.value.toLocaleString('ar-EG')}</div>
              <div className="trend">
                <FiArrowRight />
                {Math.abs(stat.trend)}% {stat.trend > 0 ? 'زيادة' : 'نقص'}
              </div>
            </div>
          </StatsCard>
        ))}
      </StatsSection>

      <QuickActions>
        <button onClick={() => exportPoems()}>
          <FiDownload />
          تصدير القصائد
        </button>
        <button onClick={() => importPoems()}>
          <FiUpload />
          استيراد القصائد
        </button>
        <button onClick={() => generateReport()}>
          <FiFileText />
          تقرير إحصائي
        </button>
        <button onClick={() => openSettings()}>
          <FiSettings />
          إعدادات
        </button>
      </QuickActions>

      <SearchSection>
        <div className="search-row">
          <div className="search-input">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن قصيدة..."
            />
          </div>
          <div className="view-toggle">
            <IconButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </IconButton>
            <IconButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </IconButton>
          </div>
        </div>
        <div className="filters-row">
          {filterOptions.map(filter => (
            <div className="filter-group" key={filter.key}>
              <label>{filter.label}</label>
              <select
                value={filter.value}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  [filter.key]: e.target.value
                }))}
              >
                <option value="">الكل</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </SearchSection>

      {viewMode === 'grid' ? (
        <PoemsGrid>
          {poems
            .filter(poem => {
              const matchesSearch = poem.title.toLowerCase().includes(search.toLowerCase()) ||
                                  poem.content.toLowerCase().includes(search.toLowerCase());
              const matchesCategory = !filters.category || poem.category === filters.category;
              const matchesPoet = !filters.poet || poem.poet.id === filters.poet;
              const matchesDate = !filters.date || filterByDate(poem.date, filters.date);
              
              return matchesSearch && matchesCategory && matchesPoet && matchesDate;
            })
            .map(poem => (
              <PoemCard
                key={poem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setCurrentPoem(poem)}
              >
                <div className="poem-header">
                  <img 
                    src={poem.poet.image} 
                    alt={poem.poet.name} 
                    className="poet-avatar"
                  />
                  <div className="info">
                    <h3>{poem.title}</h3>
                    <div className="meta">
                      <span>
                        <FiUser />
                        {poem.poet.name}
                      </span>
                      <span>
                        <FiCalendar />
                        {new Date(poem.date).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="poem-content">
                  {poem.content}
                </div>
                <div className="poem-footer">
                  <audio 
                    className="audio-player" 
                    controls 
                    src={poem.audio}
                    onPlay={() => setIsPlaying({ ...isPlaying, [poem.id]: true })}
                    onPause={() => setIsPlaying({ ...isPlaying, [poem.id]: false })}
                  />
                  <div className="actions">
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(poem);
                    }}>
                      <FiEdit2 />
                    </IconButton>
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(poem);
                    }}>
                      <FiTrash2 />
                    </IconButton>
                  </div>
                </div>
              </PoemCard>
            ))}
        </PoemsGrid>
      ) : (
        <DataTable
          columns={columns}
          data={poems.filter(poem => {
            const matchesSearch = poem.title.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !filters.category || poem.category === filters.category;
            const matchesPoet = !filters.poet || poem.poet.id === filters.poet;
            const matchesDate = !filters.date || filterByDate(poem.date, filters.date);
            
            return matchesSearch && matchesCategory && matchesPoet && matchesDate;
          })}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPoem(null);
        }}
        title={editingPoem ? 'تعديل قصيدة جديدة' : 'إضافة قصيدة جديدة'}
      >
        <StyledForm onSubmit={handleSubmit}>
          <div className="form-header">
            <div className="upload-avatar">
              <img src={imageFile || editingPoem?.image || '/photo1.jpg'} alt="صورة القصيدة" />
              <label className="upload-icon" htmlFor="image-upload">
                <FiUpload />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-grid">
            <FormGroup>
              <label>العنوان</label>
              <Input
                name="title"
                defaultValue={editingPoem?.title}
                placeholder="عنوان القصيدة"
                required
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
          </div>

          <FormGroup>
            <label>نص القصيدة</label>
            <TextArea
              name="content"
              defaultValue={editingPoem?.content}
              placeholder="اكتب نص القصيدة هنا..."
              rows={6}
              required
            />
          </FormGroup>

          <div className="form-grid">
            <FormGroup>
              <label>التصنيف</label>
              <Select
                name="category"
                defaultValue={editingPoem?.category}
                required
              >
                <option value="">اختر التصنيف</option>
                <option value="مدح">مدح</option>
                <option value="حكمة">حكمة</option>
                <option value="غزل">غزل</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <label>المقطع الصوتي</label>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
              />
            </FormGroup>
          </div>

          {(audioFile || editingPoem?.audio) && (
            <AudioPreview
              controls
              src={audioFile || editingPoem?.audio}
            />
          )}

          <div className="form-footer">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {editingPoem ? 'تحديث القصيدة' : 'إضافة القصيدة'}
            </Button>
          </div>
        </StyledForm>
      </Modal>

      <AnimatePresence>
        {currentPoem && (
          <ViewerOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCurrentPoem(null)}
          >
            <div 
              className="viewer-content"
              onClick={e => e.stopPropagation()}
            >
              <IconButton 
                className="close-btn"
                onClick={() => setCurrentPoem(null)}
              >
                <FiX />
              </IconButton>
              <div className="poem-text">
                {currentPoem.content}
              </div>
              <div className="poem-meta">
                <div className="poet">
                  <img 
                    src={currentPoem.poet.image} 
                    alt={currentPoem.poet.name} 
                  />
                  <div>
                    <h4>{currentPoem.poet.name}</h4>
                    <small>{currentPoem.category}</small>
                  </div>
                </div>
                <div className="stats">
                  <span>
                    <FiEye />
                    {currentPoem.views} مشاهدة
                  </span>
                  <span>
                    <FiHeart />
                    {currentPoem.likes} إعجاب
                  </span>
                </div>
              </div>
            </div>
          </ViewerOverlay>
        )}
      </AnimatePresence>

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
                key={poet.id}
                selected={selectedPoet?.id === poet.id}
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
    </Container>
  );
};

export default Poems; 