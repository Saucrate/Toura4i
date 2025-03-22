import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiFilter, FiDownload, FiShare2, FiImage, 
  FiCalendar, FiX, FiUpload, FiZoomIn, FiGrid, FiList,
  FiTrash2, FiEdit2, FiEye, FiHeart, FiChevronDown, FiFolder
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const PhotoCard = styled(motion.div)`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  cursor: pointer;

  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  .image-container {
    position: absolute;
    inset: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    padding: 1rem;
    opacity: 0;
    transition: opacity 0.3s ease;

    .top {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .bottom {
      margin-top: auto;
      color: white;

      h3 {
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }

      .meta {
        font-size: 0.875rem;
        opacity: 0.8;
        display: flex;
        gap: 1rem;

        span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
  }

  &:hover {
    .image-container img {
      transform: scale(1.05);
    }

    .overlay {
      opacity: 1;
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

const Photos = () => {
  const [photos, setPhotos] = useState([
    {
      id: '1',
      title: 'حفل تراثي',
      description: 'حفل تراثي في نواكشوط مع نخبة من الشعراء والمنشدين',
      category: 'المدح والتراث',
      date: '2024-03-15',
      image: '/photo1.jpg',
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    date: ''
  });
  
  const { show } = useNotification();

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
      { id: 'madh', label: 'المدح والتراث', count: 12 },
      { id: 'poets', label: 'الشعراء والمنشدون', count: 8 },
      { id: 'events', label: 'المناسبات', count: 5 }
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
      const newPhoto = {
        id: Date.now().toString(),
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        date: formData.get('date'),
        image: imageFile,
      };

      if (editingPhoto) {
        setPhotos(prev => prev.map(p => p.id === editingPhoto.id ? newPhoto : p));
        show('تم تحديث الصورة بنجاح', 'success');
      } else {
        setPhotos(prev => [...prev, newPhoto]);
        show('تمت إضافة الصورة بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingPhoto(null);
      setImageFile(null);
    } catch (error) {
      show('حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  const handleDelete = (photo) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      show('تم حذف الصورة بنجاح', 'success');
    }
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
    }
  };

  const handleDownload = (photo) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = photo.image;
      
      // Get file extension from image URL
      const extension = photo.image.split('.').pop();
      
      // Create filename from title and extension
      const filename = `${photo.title}.${extension}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      show('جاري تحميل الصورة', 'success');
    } catch (error) {
      show('حدث خطأ أثناء تحميل الصورة', 'error');
      console.error('Download error:', error);
    }
  };

  const handleShare = (photo) => {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: photo.description,
        url: window.location.href
      })
      .then(() => show('تم مشاركة الصورة بنجاح', 'success'))
      .catch(() => show('حدث خطأ أثناء المشاركة', 'error'));
    } else {
      // Fallback: Copy link to clipboard
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
            <div className="value">{photos.length}</div>
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
            <h3>المشاهدات</h3>
            <div className="value">2.5K</div>
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
            <h3>التفاعلات</h3>
            <div className="value">450</div>
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
          {photos
            .filter(photo => 
              photo.title.toLowerCase().includes(search.toLowerCase()) ||
              photo.description.toLowerCase().includes(search.toLowerCase())
            )
            .map(photo => (
              <PhotoCard
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCurrentPhoto(photo)}
              >
                <div className="image-container">
                  <img src={photo.image} alt={photo.title} />
                </div>
                <div className="overlay">
                  <div className="top">
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(photo);
                    }}>
                      <FiEdit2 />
                    </ActionButton>
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo);
                    }}>
                      <FiTrash2 />
                    </ActionButton>
                  </div>
                  <div className="bottom">
                    <h3>{photo.title}</h3>
                    <div className="meta">
                      <span>
                        <FiCalendar />
                        {new Date(photo.date).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
              </PhotoCard>
            ))}
        </PhotosGrid>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingPhoto(null);
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
                <option value="المدح والتراث">المدح والتراث</option>
                <option value="الشعراء والمنشدون">الشعراء والمنشدون</option>
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
              <label>الصورة</label>
              <FileInputWrapper>
                <FileInput
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingPhoto}
                />
                <FileInputLabel 
                  htmlFor="photo-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FiImage className="icon" />
                  <span className="main-text">اختر صورة أو اسحبها هنا</span>
                  <span className="sub-text">
                    PNG, JPG, WEBP حتى 10 ميجابايت
                  </span>
                </FileInputLabel>
              </FileInputWrapper>
              {(imageFile || editingPhoto?.image) && (
                <ImagePreview
                  src={imageFile || editingPhoto?.image}
                  alt="معاينة الصورة"
                />
              )}
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
                <img src={currentPhoto.image} alt={currentPhoto.title} />
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
      </Content>
    </Container>
  );
};

export default Photos; 