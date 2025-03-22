import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, 
  FiUser, FiPhone, FiMail
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';

const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

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

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const UserCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 20px;
  border: 2px solid ${({ theme }) => theme.colors.border.light};
  overflow: hidden;
  transition: all 0.3s ease;

  .user-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border.light};

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 16px;
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

      h3 {
        font-size: 1.125rem;
        color: ${({ theme }) => theme.colors.text.primary};
        margin-bottom: 0.5rem;
      }

      .status {
        font-size: 0.875rem;
        color: ${({ theme }) => theme.colors.success};
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;

      button {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        color: ${({ theme }) => theme.colors.text.secondary};
        border: 2px solid ${({ theme }) => theme.colors.border.light};
        transition: all 0.3s ease;

        &:hover {
          color: ${({ theme }) => theme.colors.accent};
          border-color: ${({ theme }) => theme.colors.accent};
          transform: translateY(-2px);
        }
      }
    }
  }

  .user-details {
    padding: 1.5rem;

    .detail {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.875rem;

      svg {
        color: ${({ theme }) => theme.colors.accent};
        font-size: 1.125rem;
      }
    }
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px ${({ theme }) => theme.colors.shadow}20;
  }
`;

const StyledForm = styled(Form)`
  .avatar-upload {
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    position: relative;
    
    .avatar-preview {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      border: 3px solid ${({ theme }) => theme.colors.accent};
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .upload-overlay {
      position: absolute;
      inset: 0;
      background: ${({ theme }) => theme.colors.accent}20;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
`;

const Users = () => {
  const { show } = useNotification();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Sample data
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'محمد أحمد',
      email: 'mohammed@example.com',
      phone: '+966 50 123 4567',
      avatar: '/photo1.jpg',
      status: 'نشط'
    },
    // Add more users as needed
  ]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const newUser = {
        id: editingUser?.id || Date.now().toString(),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        avatar: avatarFile || editingUser?.avatar || '/photo1.jpg',
        status: 'نشط'
      };

      if (editingUser) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? newUser : user
        ));
        show('تم تحديث بيانات المستخدم بنجاح', 'success');
      } else {
        setUsers(prev => [...prev, newUser]);
        show('تم إضافة المستخدم بنجاح', 'success');
      }

      setIsAddModalOpen(false);
      setEditingUser(null);
      setAvatarFile(null);
    } catch (error) {
      show('حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      show('تم حذف المستخدم بنجاح', 'success');
    }
  };

  return (
    <Container>
      <PageHeader>
        <div className="header-content">
          <h1>المستخدمين</h1>
          <p>إدارة حسابات المستخدمين</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة مستخدم
        </Button>
      </PageHeader>

      <SearchBar>
        <FiSearch />
        <input
          type="text"
          placeholder="ابحث عن مستخدم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      <UsersGrid>
        {users
          .filter(user => 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
          )
          .map((user, index) => (
            <UserCard
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="user-header">
                <div className="avatar">
                  <img src={user.avatar} alt={user.name} />
                </div>
                <div className="info">
                  <h3>{user.name}</h3>
                  <div className="status">{user.status}</div>
                </div>
                <div className="actions">
                  <IconButton onClick={() => {
                    setEditingUser(user);
                    setAvatarFile(user.avatar);
                    setIsAddModalOpen(true);
                  }}>
                    <FiEdit2 />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)}>
                    <FiTrash2 />
                  </IconButton>
                </div>
              </div>
              <div className="user-details">
                <div className="detail">
                  <FiMail />
                  {user.email}
                </div>
                <div className="detail">
                  <FiPhone />
                  {user.phone}
                </div>
              </div>
            </UserCard>
          ))}
      </UsersGrid>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingUser(null);
          setAvatarFile(null);
        }}
        title={editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
      >
        <StyledForm onSubmit={handleSubmit}>
          <div className="avatar-upload">
            <div className="avatar-preview">
              <img src={avatarFile || editingUser?.avatar || '/photo1.jpg'} alt="الصورة الشخصية" />
            </div>
            <label className="upload-overlay" htmlFor="avatar-input">
              <FiPlus />
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-grid">
            <FormGroup>
              <label>الاسم</label>
              <Input
                name="name"
                defaultValue={editingUser?.name}
                placeholder="أدخل اسم المستخدم"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>البريد الإلكتروني</label>
              <Input
                name="email"
                type="email"
                defaultValue={editingUser?.email}
                placeholder="example@email.com"
                required
              />
            </FormGroup>
          </div>

          <FormGroup>
            <label>رقم الهاتف</label>
            <Input
              name="phone"
              type="tel"
              defaultValue={editingUser?.phone}
              placeholder="+966 50 123 4567"
              required
            />
          </FormGroup>

          <div className="form-footer">
            <Button type="button" variant="secondary" onClick={() => {
              setIsAddModalOpen(false);
              setEditingUser(null);
            }}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'تحديث البيانات' : 'إضافة المستخدم'}
            </Button>
          </div>
        </StyledForm>
      </Modal>
    </Container>
  );
};

export default Users; 