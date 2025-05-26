import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload, FiX, FiDownload, FiShare2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import placeService from '../../services/placeService';
import { useNotification } from '../../components/common/Notification';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea, Select } from '../../components/common/Form';
import { Button } from '../../components/common/Button';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.8rem;
  font-weight: 600;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  width: 300px;

  input {
    flex: 1;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 0.5rem;
    font-size: 1rem;

    &:focus {
      outline: none;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.background.medium};
`;

const TableRow = styled.tr`
  &:hover {
    background: ${({ theme }) => theme.colors.background.medium};
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
  font-weight: 500;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, color }) => color || theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.medium};
  }
`;

const StyledForm = styled(Form)`
  .form-header {
    margin-bottom: 2rem;
    text-align: center;

    .upload-image {
      width: 300px;
      height: 200px;
      border-radius: 8px;
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
`;

const MediaPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const MediaItem = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.medium};

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
`;

const MediaViewer = styled(motion.div)`
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

    img, video {
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

const Places = () => {
  const navigate = useNavigate();
  const { show } = useNotification();
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const data = await placeService.getAllPlaces();
      setPlaces(data.places);
    } catch (error) {
      show('حدث خطأ أثناء تحميل الأماكن', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المكان؟')) {
      try {
        await placeService.deletePlace(id);
        show('تم حذف المكان بنجاح', 'success');
        loadPlaces();
      } catch (error) {
        show('حدث خطأ أثناء حذف المكان', 'error');
      }
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files); // Debug log
    
    // Dosya türü ve boyut kontrolü
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValidType) {
        show('يرجى اختيار ملفات صور أو فيديو فقط', 'error');
        return false;
      }
      if (!isValidSize) {
        show('حجم الملف يجب أن يكون أقل من 50 ميجابايت', 'error');
        return false;
      }
      return true;
    });

    setMediaFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, {
          url: reader.result,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mediaFiles.length === 0 && !editingPlace) {
      show('يرجى إضافة صورة أو فيديو واحد على الأقل', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('location', e.target.location.value);
    formData.append('type', e.target.type.value);
    formData.append('year', e.target.year.value);
    formData.append('description', e.target.description.value);
    
    // Add each media file separately
    mediaFiles.forEach((file, index) => {
      console.log(`Adding media file ${index + 1}:`, file);
      formData.append('media', file);
    });

    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      console.log('FormData entry:', pair[0], pair[1]);
    }

    try {
      if (editingPlace) {
        await placeService.updatePlace(editingPlace._id, formData);
        show('تم تحديث المكان بنجاح', 'success');
      } else {
        await placeService.createPlace(formData);
        show('تمت إضافة المكان بنجاح', 'success');
      }
      
      setIsAddModalOpen(false);
      setEditingPlace(null);
      setMediaFiles([]);
      setMediaPreviews([]);
      loadPlaces();
    } catch (error) {
      console.error('Error saving place:', error);
      show(error.response?.data?.message || 'حدث خطأ أثناء حفظ المكان', 'error');
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (place) => {
    setEditingPlace(place);
    setMediaPreviews(place.media.map(m => ({
      url: m.url,
      type: m.type
    })));
    setIsAddModalOpen(true);
  };

  const handleMediaClick = (media) => {
    if (!media || !media.url) {
      show('خطأ في عرض الوسائط', 'error');
      return;
    }
    
    setCurrentMedia({
      type: media.type,
      url: media.url,
      thumbnail: media.thumbnail
    });
  };

  const handleDownload = async (media) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.url.split('/').pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      show('حدث خطأ أثناء تحميل الملف', 'error');
    }
  };

  const handleShare = async (media) => {
    try {
      await navigator.share({
        title: 'مشاركة الصورة',
        text: 'شاهد هذه الصورة من تطبيقنا',
        url: media.url
      });
    } catch (error) {
      show('حدث خطأ أثناء مشاركة الملف', 'error');
    }
  };

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>الأماكن</Title>
        <StyledButton onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة مكان جديد
        </StyledButton>
      </Header>

      <SearchBar>
        <FiSearch />
        <input
          type="text"
          placeholder="ابحث عن مكان..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>الصور/الفيديوهات</TableHeaderCell>
            <TableHeaderCell>الاسم</TableHeaderCell>
            <TableHeaderCell>الموقع</TableHeaderCell>
            <TableHeaderCell>النوع</TableHeaderCell>
            <TableHeaderCell>العصر</TableHeaderCell>
            <TableHeaderCell>الإجراءات</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {filteredPlaces.map((place) => (
            <TableRow key={place._id}>
              <TableCell>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {place.media && place.media.length > 0 && (
                    <>
                      {(() => {
                        // Find first image or video
                        const firstImage = place.media.find(m => m.type === 'image');
                        const firstVideo = place.media.find(m => m.type === 'video');
                        const displayMedia = firstImage || firstVideo;
                        
                        if (!displayMedia) return null;

                        return (
                          <img
                            src={displayMedia.type === 'video' ? displayMedia.thumbnail : displayMedia.url}
                            alt={`${place.name}`}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover', 
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleMediaClick(displayMedia)}
                          />
                        );
                      })()}
                      {place.media.length > 1 && (
                        <div style={{ 
                          width: '50px', 
                          height: '50px', 
                          background: '#f0f0f0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          // Find next media item to show
                          const firstImage = place.media.find(m => m.type === 'image');
                          const firstVideo = place.media.find(m => m.type === 'video');
                          const displayMedia = firstImage || firstVideo;
                          const nextMedia = place.media.find(m => m !== displayMedia);
                          if (nextMedia) {
                            handleMediaClick(nextMedia);
                          }
                        }}>
                          +{place.media.length - 1}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>{place.name}</TableCell>
              <TableCell>{place.location}</TableCell>
              <TableCell>{place.type}</TableCell>
              <TableCell>{place.year}</TableCell>
              <TableCell>
                <ActionButton onClick={() => handleEdit(place)}>
                  <FiEdit2 />
                </ActionButton>
                <ActionButton
                  color="#ff4444"
                  onClick={() => handleDelete(place._id)}
                >
                  <FiTrash2 />
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlace(null);
          setMediaFiles([]);
          setMediaPreviews([]);
        }}
        title={editingPlace ? 'تعديل مكان' : 'إضافة مكان جديد'}
      >
        <StyledForm onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormGroup>
              <label>الاسم</label>
              <Input
                name="name"
                defaultValue={editingPlace?.name}
                placeholder="اسم المكان"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>الموقع</label>
              <Input
                name="location"
                defaultValue={editingPlace?.location}
                placeholder="موقع المكان"
                required
              />
            </FormGroup>
          </div>

          <div className="form-grid">
            <FormGroup>
              <label>النوع</label>
              <Select
                name="type"
                defaultValue={editingPlace?.type}
                required
              >
                <option value="">اختر النوع</option>
                <option value="أثري">أثري</option>
                <option value="تاريخي">تاريخي</option>
                <option value="طبيعي">طبيعي</option>
                <option value="ديني">ديني</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <label>العصر</label>
              <Input
                name="year"
                defaultValue={editingPlace?.year}
                placeholder="العصر التاريخي"
                required
              />
            </FormGroup>
          </div>

          <FormGroup>
            <label>الوصف</label>
            <TextArea
              name="description"
              defaultValue={editingPlace?.description}
              placeholder="وصف المكان..."
              rows={4}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>الصور والفيديوهات</label>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                style={{ display: 'none' }}
                id="media-upload"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => document.getElementById('media-upload').click()}
              >
                <FiUpload style={{ marginLeft: '0.5rem' }} />
                إضافة صور وفيديوهات
              </Button>
            </div>
            <MediaPreview>
              {mediaPreviews.map((preview, index) => (
                <MediaItem key={index}>
                  {preview.type === 'video' ? (
                    <video src={preview.url} controls />
                  ) : (
                    <img src={preview.url} alt={`Preview ${index + 1}`} />
                  )}
                  <button
                    className="remove-button"
                    onClick={() => removeMedia(index)}
                  >
                    ×
                  </button>
                </MediaItem>
              ))}
            </MediaPreview>
          </FormGroup>

          <div className="form-footer">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsAddModalOpen(false);
                setMediaFiles([]);
                setMediaPreviews([]);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {editingPlace ? 'تحديث المكان' : 'إضافة المكان'}
            </Button>
          </div>
        </StyledForm>
      </Modal>

      <AnimatePresence>
        {currentMedia && (
          <MediaViewer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="viewer-container">
              {currentMedia.type === 'video' ? (
                <video src={currentMedia.url} controls />
              ) : (
                <img src={currentMedia.url} alt="Media preview" />
              )}
              <Button 
                className="close-btn"
                variant="secondary"
                onClick={() => setCurrentMedia(null)}
              >
                <FiX />
              </Button>
              <div className="actions">
                <ActionButton onClick={() => handleDownload(currentMedia)}>
                  <FiDownload />
                </ActionButton>
                <ActionButton onClick={() => handleShare(currentMedia)}>
                  <FiShare2 />
                </ActionButton>
              </div>
            </div>
          </MediaViewer>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Places; 