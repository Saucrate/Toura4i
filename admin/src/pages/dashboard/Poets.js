import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiBook, 
  FiHeart, FiEye, FiCalendar, FiLink, FiMapPin,
  FiAward, FiBookOpen, FiShare2, FiDownload, FiUpload
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';

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

const PoetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const StyledForm = styled(Form)`
  .avatar-upload {
    width: 140px;
    height: 140px;
    margin: 0 auto 2rem;
    position: relative;
    
    .avatar-preview {
      width: 100%;
      height: 100%;
      border-radius: 30px;
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

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          transparent 60%,
          ${({ theme }) => theme.colors.accent}40
        );
      }
    }

    .upload-overlay {
      position: absolute;
      inset: 0;
      background: ${({ theme }) => theme.colors.accent}20;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 30px;
      opacity: 0;
      transition: all 0.3s ease;
      cursor: pointer;

      svg {
        font-size: 2rem;
        color: ${({ theme }) => theme.colors.accent};
        margin-bottom: 0.5rem;
      }

      span {
        font-size: 0.875rem;
        color: ${({ theme }) => theme.colors.accent};
      }
    }

    &:hover {
      .upload-overlay {
        opacity: 1;
      }
      
      .avatar-preview img {
        transform: scale(1.1);
      }
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      font-weight: 500;
    }

    input, textarea, select {
      width: 100%;
      padding: 0.875rem 1rem;
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
      }
    }

    textarea {
      min-height: 120px;
      resize: vertical;
      line-height: 1.6;
    }
  }

  .form-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
`;

const PoetCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${({ theme }) => theme.colors.border.light};

  .cover {
    height: 100px;
    background: linear-gradient(135deg, 
      ${({ theme }) => theme.colors.accent}, 
      ${({ theme }) => theme.colors.accent}40
    );
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: url('/pattern.png') repeat;
      opacity: 0.1;
      mix-blend-mode: overlay;
    }
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    border: 3px solid ${({ theme }) => theme.colors.background.light};
    background: ${({ theme }) => theme.colors.background.light};
    overflow: hidden;
    box-shadow: 0 8px 32px ${({ theme }) => theme.colors.shadow}30;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.3s ease;
    }
  }

  .content {
    padding: 1.25rem;
    text-align: center;

    h3 {
      font-size: 1.125rem;
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .period {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      margin-bottom: 0.75rem;

      svg {
        color: ${({ theme }) => theme.colors.accent};
        font-size: 1rem;
      }
    }

    .bio {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      padding: 0.75rem 0;
      border-top: 1px solid ${({ theme }) => theme.colors.border.light};

      .stat {
        text-align: center;
        position: relative;

        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.25rem;
          top: 50%;
          transform: translateY(-50%);
          height: 70%;
          width: 1px;
          background: ${({ theme }) => theme.colors.border.light};
        }

        .value {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${({ theme }) => theme.colors.text.primary};
          margin-bottom: 0.25rem;
        }

        .label {
          font-size: 0.75rem;
          color: ${({ theme }) => theme.colors.text.secondary};
        }
      }
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

    .actions {
      opacity: 1;
      transform: translateY(0);
    }

    .avatar {
      transform: scale(1.05);
      border-color: ${({ theme }) => theme.colors.accent};

      img {
        transform: scale(1.1);
      }
    }
  }
`;

const Poets = () => {
  const theme = useTheme();
  const { show } = useNotification();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPoet, setEditingPoet] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [poets, setPoets] = useState([
    {
      id: '1',
      name: 'أحمد شوقي',
      image: '/photo1.jpg',
      period: '1868 - 1932',
      bio: 'أمير الشعراء، شاعر مصري كبير ورائد الشعر العربي الحديث',
      location: 'القاهرة، مصر',
      poems: 150,
      awards: 12,
      followers: 5000
    },
    // Add more poets...
  ]);

  const stats = [
    {
      label: 'إجمالي الشعراء',
      value: poets.length,
      icon: <FiBook />,
      color: theme.colors.primary
    },
    {
      label: 'إجمالي القصائد',
      value: poets.reduce((sum, poet) => sum + poet.poems, 0),
      icon: <FiBookOpen />,
      color: theme.colors.success
    },
    {
      label: 'إجمالي الجوائز',
      value: poets.reduce((sum, poet) => sum + poet.awards, 0),
      icon: <FiAward />,
      color: theme.colors.warning
    },
    {
      label: 'إجمالي المتابعين',
      value: poets.reduce((sum, poet) => sum + poet.followers, 0),
      icon: <FiHeart />,
      color: theme.colors.error
    }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const newPoet = {
        id: editingPoet?.id || Date.now().toString(),
        name: formData.get('name'),
        period: formData.get('period'),
        bio: formData.get('bio'),
        location: formData.get('location'),
        website: formData.get('website'),
        poems: parseInt(formData.get('poems')) || 0,
        awards: parseInt(formData.get('awards')) || 0,
        followers: editingPoet?.followers || 0,
        image: imageFile || editingPoet?.image || '/photo1.jpg'
      };

      if (editingPoet) {
        setPoets(prev => prev.map(p => p.id === editingPoet.id ? newPoet : p));
        show('تم تحديث بيانات الشاعر بنجاح', 'success');
      } else {
        setPoets(prev => [...prev, newPoet]);
        show('تم إضافة الشاعر بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingPoet(null);
      setImageFile(null);
    } catch (error) {
      show('حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  return (
    <Container>
      <PageHeader>
        <div className="header-content">
          <h1>الشعراء</h1>
          <p>إدارة وعرض معلومات الشعراء وأعمالهم</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة شاعر
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن شاعر..."
        />
      </SearchBar>

      <PoetsGrid>
        {poets
          .filter(poet => 
            poet.name.toLowerCase().includes(search.toLowerCase()) ||
            poet.bio.toLowerCase().includes(search.toLowerCase())
          )
          .map((poet, index) => (
            <PoetCard
              key={poet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="cover">
                <div className="avatar">
                  <img src={poet.image} alt={poet.name} />
                </div>
              </div>
              <div className="content">
                <h3>{poet.name}</h3>
                <div className="period">
                  <FiCalendar />
                  {poet.period}
                </div>
                <p className="bio">{poet.bio}</p>
                <div className="stats">
                  <div className="stat">
                    <div className="value">{poet.poems}</div>
                    <div className="label">قصيدة</div>
                  </div>
                  <div className="stat">
                    <div className="value">{poet.awards}</div>
                    <div className="label">جائزة</div>
                  </div>
                  <div className="stat">
                    <div className="value">{poet.followers}</div>
                    <div className="label">متابع</div>
                  </div>
                </div>
              </div>
              <div className="actions">
                <IconButton onClick={() => setEditingPoet(poet)}>
                  <FiEdit2 />
                </IconButton>
                <IconButton>
                  <FiTrash2 />
                </IconButton>
              </div>
            </PoetCard>
          ))}
      </PoetsGrid>

      <Modal
        isOpen={isAddModalOpen || editingPoet}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPoet(null);
        }}
        title={editingPoet ? 'تعديل بيانات الشاعر' : 'إضافة شاعر جديد'}
      >
        <StyledForm onSubmit={handleSubmit}>
          <div className="avatar-upload">
            <div className="avatar-preview">
              <img src={imageFile || editingPoet?.image || '/photo1.jpg'} alt="صورة الشاعر" />
            </div>
            <label className="upload-overlay" htmlFor="avatar-input">
              <FiUpload />
              <span>تحميل صورة</span>
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-grid">
            <FormGroup>
              <label>اسم الشاعر</label>
              <Input
                name="name"
                defaultValue={editingPoet?.name}
                placeholder="أدخل اسم الشاعر"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>الفترة الزمنية</label>
              <Input
                name="period"
                defaultValue={editingPoet?.period}
                placeholder="مثال: 1868 - 1932"
              />
            </FormGroup>
          </div>

          <FormGroup>
            <label>نبذة تعريفية</label>
            <TextArea
              name="bio"
              defaultValue={editingPoet?.bio}
              placeholder="اكتب نبذة مختصرة عن الشاعر..."
              rows={4}
            />
          </FormGroup>

          <div className="form-grid">
            <FormGroup>
              <label>الموقع</label>
              <Input
                name="location"
                defaultValue={editingPoet?.location}
                placeholder="المدينة، البلد"
              />
            </FormGroup>

            <FormGroup>
              <label>الموقع الإلكتروني</label>
              <Input
                name="website"
                defaultValue={editingPoet?.website}
                placeholder="https://..."
                type="url"
              />
            </FormGroup>
          </div>

          <div className="form-grid">
            <FormGroup>
              <label>عدد القصائد</label>
              <Input
                name="poems"
                type="number"
                defaultValue={editingPoet?.poems}
                min="0"
              />
            </FormGroup>

            <FormGroup>
              <label>عدد الجوائز</label>
              <Input
                name="awards"
                type="number"
                defaultValue={editingPoet?.awards}
                min="0"
              />
            </FormGroup>
          </div>

          <div className="form-footer">
            <Button type="button" variant="secondary" onClick={() => {
              setIsAddModalOpen(false);
              setEditingPoet(null);
            }}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {editingPoet ? 'تحديث البيانات' : 'إضافة الشاعر'}
            </Button>
          </div>
        </StyledForm>
      </Modal>
    </Container>
  );
};

export default Poets; 