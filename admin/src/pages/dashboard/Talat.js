import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFilter, FiDownload, FiShare2, FiPlay, FiPause } from 'react-icons/fi';
import { Button, ButtonGroup } from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea } from '../../components/common/Form';
import SearchAndFilter from '../../components/common/SearchAndFilter';
import { useNotification } from '../../components/common/Notification';
import AudioPlayer from '../../components/common/AudioPlayer';

const PageContainer = styled(motion.div)`
  padding: 2rem;
  overflow: hidden;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.75rem;
  font-weight: 600;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};

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
`;

const ContentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterChip = styled(motion.button)`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.border.light};
  background: ${({ theme, active }) => 
    active ? theme.colors.accent + '20' : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const FilterModal = ({ isOpen, onClose, onApply, initialValues }) => {
  const [filters, setFilters] = useState(initialValues);

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تصفية متقدمة"
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label>من تاريخ</label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <label>إلى تاريخ</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <label>المنشد</label>
          <Input
            value={filters.performer}
            onChange={(e) => setFilters(prev => ({ ...prev, performer: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <label>الشاعر</label>
          <Input
            value={filters.poet}
            onChange={(e) => setFilters(prev => ({ ...prev, poet: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <label>المكان</label>
          <Input
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          />
        </FormGroup>

        <ButtonGroup align="end">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">
            تطبيق
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

const AudioPreview = styled.audio`
  width: 100%;
  margin: 1rem 0;
  border-radius: 8px;
`;

const Talat = () => {
  const [talat, setTalat] = useState([
    {
      id: '1',
      title: 'طلعة الشيخ سيديا',
      performer: 'محمد ولد امين',
      poet: 'الشيخ سيديا',
      description: 'من أشهر الطلعات الموريتانية',
      date: '2024-03-15',
      location: 'نواكشوط',
      audio: '/track1.mp3',
      image: '/photo1.jpg',
      lyrics: `أَلَا يَا حَادِي العِيسِ قِفْ بِالرَّكْبِ
نُسَائِلُ عَنْ أَحْبَابِنَا أَهْلِ الحُبِّ`,
    },
  ]);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTalat, setEditingTalat] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    dateFrom: '',
    dateTo: '',
    performer: '',
    poet: '',
    location: ''
  });
  
  const audioRef = useRef(null);
  const { show } = useNotification();

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'recent', label: 'الأحدث' },
    { id: 'popular', label: 'الأكثر استماعاً' },
    { id: 'featured', label: 'المميزة' },
  ];

  const stats = [
    { label: 'إجمالي الطلعات', value: talat.length },
    { label: 'عدد المنشدين', value: '15' },
    { label: 'عدد المشاهدات', value: '1.2K' },
    { label: 'التفاعلات', value: '324' },
  ];

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
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.performer}</div>
          </div>
        </div>
      )
    },
    { key: 'poet', label: 'الشاعر' },
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
            {isPlaying && currentTrack?.id === item.id ? <FiPause /> : <FiPlay />}
            {isPlaying && currentTrack?.id === item.id ? 'إيقاف' : 'تشغيل'}
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handleEdit(item)}
          >
            تعديل
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => handleDelete(item)}
          >
            حذف
          </Button>
        </ButtonGroup>
      )
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const newTalat = {
        id: Date.now().toString(),
        title: formData.get('title'),
        performer: formData.get('performer'),
        poet: formData.get('poet'),
        description: formData.get('description'),
        date: formData.get('date'),
        location: formData.get('location'),
        lyrics: formData.get('lyrics'),
        audio: audioFile,
        image: imageFile,
      };

      if (editingTalat) {
        setTalat(prev => prev.map(t => t.id === editingTalat.id ? newTalat : t));
        show('تم تحديث الطلعة بنجاح', 'success');
      } else {
        setTalat(prev => [...prev, newTalat]);
        show('تمت إضافة الطلعة بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingTalat(null);
      setAudioFile(null);
      setImageFile(null);
    } catch (error) {
      show('حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  const handleDelete = (item) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الطلعة؟')) {
      setTalat(prev => prev.filter(t => t.id !== item.id));
      show('تم حذف الطلعة بنجاح', 'success');
    }
  };

  const handleEdit = (item) => {
    setEditingTalat(item);
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(URL.createObjectURL(file));
    }
  };

  const handlePlay = (item) => {
    if (currentTrack?.id === item.id) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack({
        id: item.id,
        title: item.title,
        albumTitle: item.performer,
        albumCover: item.image,
        audioUrl: item.audio
      });
      setIsPlaying(true);
    }
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    
    let filteredData = [...talat];
    
    switch(filterId) {
      case 'recent':
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'popular':
        // Assuming we have a views/plays count
        filteredData.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'featured':
        filteredData = filteredData.filter(item => item.featured);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }
    
    setTalat(filteredData);
  };

  const handleExport = () => {
    // Implement export functionality
    const data = talat.map(item => ({
      title: item.title,
      performer: item.performer,
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
    link.setAttribute("download", "talat.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    show('تم تصدير البيانات بنجاح', 'success');
  };

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <PageHeader>
        <Title>الطلعات</Title>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة طلعة
        </Button>
      </PageHeader>

      <StatsContainer>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.1 }
            }}
          >
            <h3>{stat.label}</h3>
            <div className="value">{stat.value}</div>
          </StatCard>
        ))}
      </StatsContainer>

      <ContentCard>
        <CardHeader>
          <h2>قائمة الطلعات</h2>
          <ButtonGroup>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => setShowFilterModal(true)}
            >
              <FiFilter />
              تصفية متقدمة
            </Button>
            <Button 
              variant="secondary" 
              size="small"
              onClick={handleExport}
            >
              <FiDownload />
              تصدير
            </Button>
          </ButtonGroup>
        </CardHeader>

        <div style={{ padding: '1.5rem' }}>
          <FilterBar>
            {filters.map((filter) => (
              <FilterChip
                key={filter.id}
                active={activeFilter === filter.id}
                onClick={() => handleFilterChange(filter.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.label}
              </FilterChip>
            ))}
          </FilterBar>

          <SearchAndFilter
            searchValue={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن طلعة..."
          />

          <DataTable
            columns={columns}
            data={talat.filter(item => 
              item.title.includes(search) ||
              item.performer.includes(search) ||
              item.poet.includes(search)
            )}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </ContentCard>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTalat(null);
        }}
        title={editingTalat ? 'تعديل الطلعة' : 'إضافة طلعة'}
      >
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>العنوان</label>
            <Input
              name="title"
              defaultValue={editingTalat?.title}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>المنشد</label>
            <Input
              name="performer"
              defaultValue={editingTalat?.performer}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>الشاعر</label>
            <Input
              name="poet"
              defaultValue={editingTalat?.poet}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>التاريخ</label>
            <Input
              type="date"
              name="date"
              defaultValue={editingTalat?.date}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>المكان</label>
            <Input
              name="location"
              defaultValue={editingTalat?.location}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>الوصف</label>
            <TextArea
              name="description"
              defaultValue={editingTalat?.description}
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <label>كلمات الطلعة</label>
            <TextArea
              name="lyrics"
              defaultValue={editingTalat?.lyrics}
              rows={5}
              dir="rtl"
            />
          </FormGroup>

          <FormGroup>
            <label>الصورة</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {(imageFile || editingTalat?.image) && (
              <ImagePreview
                src={imageFile || editingTalat?.image}
                alt="معاينة الصورة"
              />
            )}
          </FormGroup>

          <FormGroup>
            <label>المقطع الصوتي</label>
            <Input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
            />
            {(audioFile || editingTalat?.audio) && (
              <AudioPreview
                controls
                src={audioFile || editingTalat?.audio}
              />
            )}
          </FormGroup>

          <ButtonGroup align="end">
            <Button type="submit">
              {editingTalat ? 'تحديث' : 'إضافة'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialValues={filterOptions}
        onApply={(filters) => {
          setFilterOptions(filters);
          const filtered = talat.filter(item => {
            const dateMatch = (!filters.dateFrom || item.date >= filters.dateFrom) &&
                             (!filters.dateTo || item.date <= filters.dateTo);
            const performerMatch = !filters.performer || 
                                 item.performer.includes(filters.performer);
            const poetMatch = !filters.poet || item.poet.includes(filters.poet);
            const locationMatch = !filters.location || 
                                item.location.includes(filters.location);
            
            return dateMatch && performerMatch && poetMatch && locationMatch;
          });
          setTalat(filtered);
        }}
      />

      <AnimatePresence>
        {currentTrack && (
          <>
            <audio
              ref={audioRef}
              src={currentTrack.audioUrl}
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
    </PageContainer>
  );
};

export default Talat; 