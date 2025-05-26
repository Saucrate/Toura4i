import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiFilter, FiDownload, FiShare2, FiImage, 
  FiCalendar, FiX, FiUpload, FiZoomIn, FiGrid, FiList,
  FiTrash2, FiEdit2, FiEye, FiHeart, FiChevronDown, FiFolder, FiUser, FiSearch, FiChevronLeft, FiChevronRight, FiMessageSquare
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, Input, TextArea, Select } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';
import photoService from '../../services/photoService';
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

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  min-height: 0;

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

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const PhotoCard = styled(motion.div)`
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

  .image-carousel {
    position: relative;
    width: 100%;
    padding-top: 66.67%; // 3:2 aspect ratio
    overflow: hidden;
    background: ${({ theme }) => theme.colors.background.dark};

    .carousel-container {
    position: absolute;
    inset: 0;
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -ms-overflow-style: none;
      
      &::-webkit-scrollbar {
        display: none;
      }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
        scroll-snap-align: start;
        flex: 0 0 100%;
      transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
    }
  }

    .carousel-indicators {
    position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      z-index: 1;
      padding: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
      border-radius: 20px;
      backdrop-filter: blur(4px);

      .indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: white;
          transform: scale(1.2);
        }

        &:hover {
          background: white;
          transform: scale(1.1);
        }
      }
    }

    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
    display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    opacity: 0;
      transition: all 0.2s ease;
      z-index: 1;
      backdrop-filter: blur(4px);

      &:hover {
        background: rgba(0, 0, 0, 0.7);
        transform: translateY(-50%) scale(1.1);
      }

      &.left {
        left: 1rem;
      }

      &.right {
        right: 1rem;
      }
    }

    &:hover .carousel-arrow {
      opacity: 1;
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

const ActionButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PhotoViewer = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  backdrop-filter: blur(8px);

  .viewer-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;

    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    .close-btn {
      position: absolute;
      top: -3rem;
      right: 0;
      color: white;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(4px);
    }

    .info-panel {
      position: absolute;
      bottom: -4rem;
      left: 0;
      right: 0;
      color: white;
      text-align: center;
      
      .title {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
      
      .meta {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }

    .actions {
      position: absolute;
      top: -3rem;
      left: 0;
      display: flex;
      gap: 0.5rem;
    }
  }
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: ${({ align }) => align || 'flex-start'};
`;

const ImagePreview = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const FiltersBar = styled.div`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  overflow: hidden;
  margin-bottom: 1rem;
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

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ActiveFilters = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  .badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.5rem;
    background: ${({ theme }) => theme.colors.background.medium};
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.text.primary};

    button {
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      cursor: pointer;
    }
  }
`;

const FiltersContent = styled(motion.div)`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.light};
`;

const FiltersInner = styled(motion.div)`
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  .filter-section {
    padding: 1rem;
    background: ${({ theme }) => theme.colors.background.medium};
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border.light};

    h4 {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${({ theme, color }) => theme.colors[color] + '20'};
    color: ${({ theme, color }) => theme.colors[color]};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .content {
    flex: 1;

    h3 {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .value {
      color: ${({ theme }) => theme.colors.text.primary};
      font-size: 1.5rem;
      font-weight: 600;
    }
  }
`;

const FilterChip = styled(motion.button)`
  padding: 0.5rem 1rem;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

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
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px dashed ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }

  .icon {
    font-size: 2rem;
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

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .actions {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s ease;

    button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  &:hover .actions {
    opacity: 1;
  }

  &.main {
    border-color: ${({ theme }) => theme.colors.accent};
    border-width: 2px;
  }
`;

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isPersonSelectorOpen, setIsPersonSelectorOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imageOrder, setImageOrder] = useState([]);
  const [activeImageIndices, setActiveImageIndices] = useState({});
  
  const { show } = useNotification();

  // Fetch photos and stats on component mount
  useEffect(() => {
    fetchPhotos();
    fetchStats();
    loadPersons();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getAllPhotos();
      setPhotos(response.photos);
    } catch (error) {
      show('حدث خطأ أثناء جلب الصور', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await photoService.getAllPhotos();
      const totalViews = response.photos.reduce((sum, photo) => sum + (photo.views || 0), 0);
      const totalLikes = response.photos.reduce((sum, photo) => sum + (photo.likes || 0), 0);
      const totalComments = response.photos.reduce((sum, photo) => sum + (photo.comments?.length || 0), 0);
      
      setStats({
        totalPhotos: response.photos.length,
        totalViews,
        totalLikes,
        totalComments
      });
    } catch (error) {
      show('حدث خطأ أثناء جلب الإحصائيات', 'error');
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

  const columns = [
    { key: 'title', label: 'العنوان' },
    { key: 'category', label: 'التصنيف' },
    { key: 'date', label: 'التاريخ' },
  ];

  const filters = [
    {
      key: 'category',
      label: 'التصنيف',
      value: selectedCategory,
      options: [
        { value: 'المدح والتراث', label: 'المدح والتراث' },
        { value: 'الشعراء والمنشدون', label: 'الشعراء والمنشدون' },
      ],
    },
  ];

  const filterOptions = {
    categories: [
      { id: 'all', label: 'جميع التصنيفات', count: photos.length },
      { id: 'manuscripts', label: 'مخطوطة', count: photos.filter(p => p.category === 'manuscripts').length },
      { id: 'instruments', label: 'الآلات الموسيقية القديمة', count: photos.filter(p => p.category === 'instruments').length },
      { id: 'historical', label: 'الآثار التاريخية', count: photos.filter(p => p.category === 'historical').length },
      { id: 'mosques', label: 'المساجد', count: photos.filter(p => p.category === 'mosques').length },
      { id: 'architecture', label: 'العمارة', count: photos.filter(p => p.category === 'architecture').length },
      { id: 'artifacts', label: 'القطع الأثرية', count: photos.filter(p => p.category === 'artifacts').length },
      { id: 'calligraphy', label: 'الخط العربي', count: photos.filter(p => p.category === 'calligraphy').length },
      { id: 'cultural', label: 'التراث الثقافي', count: photos.filter(p => p.category === 'cultural').length },
      { id: 'events', label: 'المناسبات', count: photos.filter(p => p.category === 'events').length },
      { id: 'people', label: 'الشخصيات', count: photos.filter(p => p.category === 'people').length },
      { id: 'landmarks', label: 'المعالم', count: photos.filter(p => p.category === 'landmarks').length },
      { id: 'traditions', label: 'التقاليد', count: photos.filter(p => p.category === 'traditions').length },
      { id: 'ceremonies', label: 'الاحتفالات', count: photos.filter(p => p.category === 'ceremonies').length },
      { id: 'other', label: 'أخرى', count: photos.filter(p => p.category === 'other').length }
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
    try {
    const formData = new FormData(e.target);
    
      // Add all image files
      if (imageFiles.length > 0) {
        imageFiles.forEach(({ file }) => {
          formData.append('images', file);
        });
      }

      // Add images to delete if any
      if (imagesToDelete.length > 0) {
        formData.append('deleteImages', JSON.stringify(imagesToDelete));
      }

      // Add image order if changed
      if (imageOrder.length > 0) {
        formData.append('imageOrder', JSON.stringify(imageOrder));
    }

    if (selectedPerson) {
      formData.append('person', selectedPerson._id);
    }
    
      // Log form data before submission
      console.log('Submitting form data:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      let response;
      if (editingPhoto) {
        response = await photoService.updatePhoto(editingPhoto._id, formData);
        show('تم تحديث الصورة بنجاح', 'success');
      } else {
        response = await photoService.createPhoto(formData);
        show('تمت إضافة الصورة بنجاح', 'success');
      }

      console.log('Server response:', response);

      // Reset form and state
      setIsAddModalOpen(false);
      setEditingPhoto(null);
      setImageFiles([]);
      setImagesToDelete([]);
      setImageOrder([]);
      setSelectedPerson(null);
      
      // Refresh photos list
      await fetchPhotos();
    } catch (error) {
      console.error('Error submitting form:', error);
      show(error.message || 'حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  const handleDelete = async (photo) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      try {
        await photoService.deletePhoto(photo._id);
      show('تم حذف الصورة بنجاح', 'success');
        fetchPhotos(); // Refresh photos list
      } catch (error) {
        show('حدث خطأ أثناء حذف الصورة', 'error');
      }
    }
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    if (photo.person) {
      setSelectedPerson({
        _id: photo.person._id,
        name: photo.person.name,
        image: photo.person.image,
        bio: photo.person.bio
      });
    }
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        show('حجم الصورة يجب أن يكون أقل من 10 ميجابايت', 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))]);
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleDeleteExistingImage = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const handleReorderImages = (dragIndex, dropIndex) => {
    setImageOrder(prev => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(dragIndex, 1);
      newOrder.splice(dropIndex, 0, removed);
      return newOrder;
    });
  };

  const handleDownload = async (photo) => {
    try {
      const link = document.createElement('a');
      link.href = photo.image;
      const extension = photo.image.split('.').pop();
      const filename = `${photo.title}.${extension}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      show('جاري تحميل الصورة', 'success');
    } catch (error) {
      show('حدث خطأ أثناء تحميل الصورة', 'error');
    }
  };

  const handleShare = (photo) => {
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: photo.description,
        url: window.location.href
      })
      .then(() => show('تم مشاركة الصورة بنجاح', 'success'))
      .catch(() => show('حدث خطأ أثناء المشاركة', 'error'));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => show('تم نسخ الرابط إلى الحافظة', 'success'))
        .catch(() => show('حدث خطأ أثناء نسخ الرابط', 'error'));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageChange({ target: { files: [file] } });
      } else {
        show('يجب أن يكون الملف صورة', 'error');
      }
    }
  };

  const getActiveFilterLabels = () => {
    return filters.filter(filter => filter.value);
  };

  const clearFilter = (key) => {
    setSelectedCategory('');
  };

  const handleFilterChange = (key, value) => {
    setSelectedCategory(value);
  };

  const handleImageScroll = (photoId, event) => {
    const container = event.target;
    const scrollPosition = container.scrollLeft;
    const imageWidth = container.clientWidth;
    const activeIndex = Math.round(scrollPosition / imageWidth);
    setActiveImageIndices(prev => ({
      ...prev,
      [photoId]: activeIndex
    }));
  };

  const handleImageNavigation = (photoId, direction) => {
    const container = document.querySelector(`#carousel-${photoId}`);
    if (container) {
      const imageWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - imageWidth 
        : currentScroll + imageWidth;
      container.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  return (
    <Container>
      <Header>
        <Title>الصور</Title>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة صورة
        </Button>
      </Header>

      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          color="accent"
        >
          <div className="icon">
            <FiImage />
          </div>
          <div className="content">
            <h3>إجمالي الصور</h3>
            <div className="value">{stats.totalPhotos}</div>
          </div>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          color="success"
        >
          <div className="icon">
            <FiEye />
          </div>
          <div className="content">
            <h3>إجمالي المشاهدات</h3>
            <div className="value">{stats.totalViews}</div>
          </div>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          color="warning"
        >
          <div className="icon">
            <FiHeart />
          </div>
          <div className="content">
            <h3>إجمالي الإعجابات</h3>
            <div className="value">{stats.totalLikes}</div>
            </div>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          color="info"
        >
          <div className="icon">
            <FiMessageSquare />
          </div>
          <div className="content">
            <h3>إجمالي التعليقات</h3>
            <div className="value">{stats.totalComments}</div>
          </div>
        </StatCard>
      </StatsContainer>

      <FiltersBar>
        <FiltersHeader 
          isOpen={isFiltersOpen}
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        >
          <h3>
            <FiFilter />
            تصفية الصور
          </h3>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن صورة..."
            style={{ width: '300px' }}
            onClick={(e) => e.stopPropagation()}
          />
          <FiChevronDown className="toggle-icon" />
        </FiltersHeader>

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
                  <h4>
                    <FiFolder />
                    التصنيف
                  </h4>
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
                  <h4>
                    <FiCalendar />
                    التاريخ
                  </h4>
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
                </div>
              </FiltersInner>
            </FiltersContent>
          )}
        </AnimatePresence>
      </FiltersBar>

      <Content>
        <PhotosGrid>
          {loading ? (
            <div>جاري التحميل...</div>
          ) : (
            photos
            .filter(photo => 
              photo.title.toLowerCase().includes(search.toLowerCase()) ||
              photo.description.toLowerCase().includes(search.toLowerCase())
            )
              .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
            .map(photo => (
              <PhotoCard
                  key={photo._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="image-carousel">
                    <div 
                      id={`carousel-${photo._id}`}
                      className="carousel-container"
                      onScroll={(e) => handleImageScroll(photo._id, e)}
                    >
                      {photo.images
                        .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort images by order
                        .map((image, index) => (
                          <img 
                            key={image._id} 
                            src={image.url} 
                            alt={`${photo.title} - Image ${index + 1}`}
                            loading="lazy"
                          />
                        ))}
                </div>
                    
                    {photo.images.length > 1 && (
                      <>
                        <div className="carousel-indicators">
                          {photo.images.map((_, index) => (
                            <div
                              key={index}
                              className={`indicator ${activeImageIndices[photo._id] === index ? 'active' : ''}`}
                              onClick={() => {
                                const container = document.querySelector(`#carousel-${photo._id}`);
                                if (container) {
                                  container.scrollTo({
                                    left: container.clientWidth * index,
                                    behavior: 'smooth'
                                  });
                                }
                              }}
                            />
                          ))}
                  </div>
                        <button 
                          className="carousel-arrow left"
                          onClick={() => handleImageNavigation(photo._id, 'left')}
                          aria-label="Previous image"
                        >
                          <FiChevronLeft />
                        </button>
                        <button 
                          className="carousel-arrow right"
                          onClick={() => handleImageNavigation(photo._id, 'right')}
                          aria-label="Next image"
                        >
                          <FiChevronRight />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="card-content">
                    <h3 className="title">{photo.title}</h3>
                    <div className="meta">
                      <div className="meta-group">
                        <FiCalendar />
                        <span>{new Date(photo.date).toLocaleDateString('ar-EG')}</span>
                    </div>
                      {photo.category && (
                        <div className="meta-group">
                          <FiFolder />
                          <span>{photo.category}</span>
                        </div>
                      )}
                      <div className="meta-group">
                        <FiEye />
                        <span>المشاهدات</span>
                        <span className="count">{photo.views || 0}</span>
                      </div>
                      <div className="meta-group">
                        <FiHeart />
                        <span>الإعجابات</span>
                        <span className="count">{photo.likes?.length || 0}</span>
                      </div>
                      <div className="meta-group">
                        <FiMessageSquare />
                        <span>التعليقات</span>
                        <span className="count">{photo.comments?.length || 0}</span>
                      </div>
                    </div>
                    {photo.description && (
                      <p className="description">{photo.description}</p>
                    )}
                    <div className="actions">
                      <button onClick={() => handleEdit(photo)}>
                        <FiEdit2 />
                        تعديل
                      </button>
                      <button onClick={() => handleDelete(photo)}>
                        <FiTrash2 />
                        حذف
                      </button>
                      <button onClick={() => setCurrentPhoto(photo)}>
                        <FiEye />
                        عرض
                      </button>
                  </div>
                </div>
              </PhotoCard>
              ))
          )}
        </PhotosGrid>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingPhoto(null);
            setImageFiles([]);
            setImagesToDelete([]);
            setImageOrder([]);
          }}
          title={editingPhoto ? 'تعديل الصورة' : 'إضافة صورة'}
        >
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label>العنوان</label>
              <Input
                name="title"
                defaultValue={editingPhoto?.title}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>التصنيف</label>
              <Select
                name="category"
                defaultValue={editingPhoto?.category}
                required
              >
                <option value="">اختر التصنيف</option>
                <option value="manuscripts">مخطوطة</option>
                <option value="instruments">الآلات الموسيقية القديمة</option>
                <option value="historical">الآثار التاريخية</option>
                <option value="mosques">المساجد</option>
                <option value="architecture">العمارة</option>
                <option value="artifacts">القطع الأثرية</option>
                <option value="calligraphy">الخط العربي</option>
                <option value="cultural">التراث الثقافي</option>
                <option value="events">المناسبات</option>
                <option value="people">الشخصيات</option>
                <option value="landmarks">المعالم</option>
                <option value="traditions">التقاليد</option>
                <option value="ceremonies">الاحتفالات</option>
                <option value="other">أخرى</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <label>التاريخ</label>
              <DateInput
                type="date"
                name="date"
                defaultValue={editingPhoto?.date}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>الوصف</label>
              <TextArea
                name="description"
                defaultValue={editingPhoto?.description}
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <label>الصور</label>
              <FileInputWrapper>
                <FileInput
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  required={!editingPhoto && imageFiles.length === 0}
                />
                <FileInputLabel 
                  htmlFor="photo-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FiImage className="icon" />
                  <span className="main-text">
                    {editingPhoto ? 'إضافة صور جديدة' : 'اختر صور أو اسحبها هنا'}
                  </span>
                  <span className="sub-text">
                    PNG, JPG, WEBP حتى 10 ميجابايت لكل صورة
                  </span>
                </FileInputLabel>
              </FileInputWrapper>

              {/* Preview of new images */}
              {imageFiles.length > 0 && (
                <ImagePreviewGrid>
                  {imageFiles.map((image, index) => (
                    <ImagePreviewItem key={index}>
                      <img src={image.preview} alt={`Preview ${index + 1}`} />
                      <div className="actions">
                        <button onClick={() => handleRemoveImage(index)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </ImagePreviewItem>
                  ))}
                </ImagePreviewGrid>
              )}

              {/* Preview of existing images */}
              {editingPhoto && editingPhoto.images && (
                <ImagePreviewGrid>
                  {editingPhoto.images
                    .filter(img => !imagesToDelete.includes(img._id))
                    .map((image, index) => (
                      <ImagePreviewItem 
                        key={image._id}
                        className={image.isMain ? 'main' : ''}
                      >
                        <img src={image.url} alt={`Image ${index + 1}`} />
                        <div className="actions">
                          <button onClick={() => handleDeleteExistingImage(image._id)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </ImagePreviewItem>
                    ))}
                </ImagePreviewGrid>
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
                {editingPhoto ? 'تحديث' : 'إضافة'}
              </Button>
            </ButtonGroup>
          </Form>
        </Modal>

        <AnimatePresence>
          {currentPhoto && (
            <PhotoViewer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="backdrop" onClick={() => setCurrentPhoto(null)} />
              <div className="viewer-container">
                <img 
                  src={currentPhoto.images.find(img => img.isMain)?.url || currentPhoto.images[0]?.url} 
                  alt={currentPhoto.title} 
                />
                {currentPhoto.images.length > 1 && (
                  <div className="image-navigation">
                    {/* Add image navigation controls here */}
                  </div>
                )}
                <Button 
                  className="close-btn"
                  variant="secondary"
                  onClick={() => setCurrentPhoto(null)}
                >
                  <FiX />
                </Button>
                <div className="actions">
                  <ActionButton onClick={() => handleEdit(currentPhoto)}>
                    <FiEdit2 />
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(currentPhoto)}>
                    <FiTrash2 />
                  </ActionButton>
                  <ActionButton onClick={() => handleDownload(currentPhoto)}>
                    <FiDownload />
                  </ActionButton>
                  <ActionButton onClick={() => handleShare(currentPhoto)}>
                    <FiShare2 />
                  </ActionButton>
                </div>
                <div className="info-panel">
                  <div className="title">{currentPhoto.title}</div>
                  <div className="meta">{currentPhoto.description}</div>
                </div>
              </div>
            </PhotoViewer>
          )}
        </AnimatePresence>

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
      </Content>
    </Container>
  );
};

export default Photos; 