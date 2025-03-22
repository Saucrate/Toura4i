import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus } from 'react-icons/fi';
import { Button, ButtonGroup } from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea } from '../../components/common/Form';
import SearchAndFilter from '../../components/common/SearchAndFilter';
import { useNotification } from '../../components/common/Notification';

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

const ImagePreview = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const Playlists = () => {
  const [playlists, setPlaylists] = useState([
    {
      id: '1',
      name: 'أجمل قصائد المديح',
      description: 'مجموعة مختارة من أجمل قصائد المديح النبوي',
      tracksCount: 5,
      image: '/photo1.jpg',
    },
  ]);

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const { show } = useNotification();

  const columns = [
    { key: 'name', label: 'الاسم' },
    { key: 'tracksCount', label: 'عدد المقاطع' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const newPlaylist = {
        id: Date.now().toString(),
        name: formData.get('name'),
        description: formData.get('description'),
        tracksCount: 0,
        image: imageFile,
      };

      if (editingPlaylist) {
        setPlaylists(prev => prev.map(p => p.id === editingPlaylist.id ? newPlaylist : p));
        show('تم تحديث قائمة التشغيل بنجاح', 'success');
      } else {
        setPlaylists(prev => [...prev, newPlaylist]);
        show('تمت إضافة قائمة التشغيل بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingPlaylist(null);
      setImageFile(null);
    } catch (error) {
      show('حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  const handleDelete = (playlist) => {
    if (window.confirm('هل أنت متأكد من حذف قائمة التشغيل هذه؟')) {
      setPlaylists(prev => prev.filter(p => p.id !== playlist.id));
      show('تم حذف قائمة التشغيل بنجاح', 'success');
    }
  };

  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist);
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <PageHeader>
        <Title>قوائم التشغيل</Title>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة قائمة
        </Button>
      </PageHeader>

      <SearchAndFilter
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        columns={columns}
        data={playlists.filter(playlist => 
          playlist.name.includes(search)
        )}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlaylist(null);
        }}
        title={editingPlaylist ? 'تعديل قائمة التشغيل' : 'إضافة قائمة تشغيل'}
      >
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>الاسم</label>
            <Input
              name="name"
              defaultValue={editingPlaylist?.name}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>الوصف</label>
            <TextArea
              name="description"
              defaultValue={editingPlaylist?.description}
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <label>الصورة</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {(imageFile || editingPlaylist?.image) && (
              <ImagePreview
                src={imageFile || editingPlaylist?.image}
                alt="معاينة الصورة"
              />
            )}
          </FormGroup>

          <ButtonGroup align="end">
            <Button type="submit">
              {editingPlaylist ? 'تحديث' : 'إضافة'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </div>
  );
};

export default Playlists; 