import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiTrash2, FiBell, FiCheck, FiX,
  FiMail, FiPhone, FiUser, FiLock, FiUnlock
} from 'react-icons/fi';
import { Button, IconButton } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Form, FormGroup, Input, TextArea } from '../../components/common/Form';
import { useNotification } from '../../components/common/Notification';
import userService from '../../services/userService';

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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  .selection-info {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
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
  border: 2px solid ${({ theme, selected }) => 
    selected ? theme.colors.accent : theme.colors.border.light};
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;

  .checkbox {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 10;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.accent};
    background: ${({ theme, selected }) => 
      selected ? theme.colors.accent : 'transparent'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }

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
        color: ${({ theme, blocked }) => 
          blocked ? theme.colors.error : theme.colors.success};
        display: flex;
        align-items: center;
        gap: 0.25rem;
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
  .form-footer {
      display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
`;

const Users = () => {
  const { show } = useNotification();
  const [search, setSearch] = useState('');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      show(error.message || 'Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      show('Please select at least one user', 'error');
      return;
    }
    
    if (!notificationMessage.trim()) {
      show('Please enter a notification message', 'error');
      return;
    }
    
    try {
      await userService.sendNotification(selectedUsers, notificationMessage);
      show('Notification sent successfully', 'success');
      setIsNotificationModalOpen(false);
      setNotificationMessage('');
      setSelectedUsers([]);
    } catch (error) {
      show(error.message || 'Error sending notification', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        show('User deleted successfully', 'success');
        setUsers(prev => prev.filter(user => user._id !== userId));
        setSelectedUsers(prev => prev.filter(id => id !== userId));
      } catch (error) {
        show(error.message || 'Error deleting user', 'error');
      }
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const response = await userService.toggleUserBlock(userId);
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isActive: !user.isActive } : user
      ));
      show(response.message, 'success');
    } catch (error) {
      show(error.message || 'Error toggling user block status', 'error');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <PageHeader>
        <div className="header-content">
          <h1>Users</h1>
          <p>Manage user accounts</p>
        </div>
      </PageHeader>

      <SearchBar>
        <FiSearch />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      <ActionBar>
        <div className="selection-info">
          {selectedUsers.length > 0 
            ? `${selectedUsers.length} users selected` 
            : 'No users selected'}
        </div>
        <div className="action-buttons">
          <Button 
            variant="secondary" 
            onClick={handleSelectAll}
            disabled={users.length === 0}
          >
            {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button 
            onClick={() => setIsNotificationModalOpen(true)}
            disabled={selectedUsers.length === 0}
          >
            <FiBell />
            Send Notification
          </Button>
        </div>
      </ActionBar>

      <UsersGrid>
        {filteredUsers.map((user, index) => (
            <UserCard
            key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            selected={selectedUsers.includes(user._id)}
          >
            <div 
              className="checkbox"
              onClick={() => handleToggleSelect(user._id)}
            >
              {selectedUsers.includes(user._id) && <FiCheck size={14} />}
            </div>
              <div className="user-header">
                <div className="avatar">
                <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
                </div>
                <div className="info">
                  <h3>{user.name}</h3>
                <div className="status" blocked={!user.isActive}>
                  {!user.isActive ? <FiLock size={14} /> : <FiUnlock size={14} />}
                  {user.isActive ? 'Active' : 'Blocked'}
                </div>
                </div>
                <div className="actions">
                <IconButton onClick={() => handleToggleBlock(user._id)}>
                  {!user.isActive ? <FiUnlock /> : <FiLock />}
                  </IconButton>
                <IconButton onClick={() => handleDeleteUser(user._id)}>
                    <FiTrash2 />
                  </IconButton>
                </div>
              </div>
              <div className="user-details">
                <div className="detail">
                  <FiMail />
                  {user.email}
                </div>
              {user.phone && (
                <div className="detail">
                  <FiPhone />
                  {user.phone}
                </div>
              )}
              </div>
            </UserCard>
          ))}
      </UsersGrid>

      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setNotificationMessage('');
        }}
        title="Send Notification"
      >
        <Form onSubmit={handleSendNotification}>
          <FormGroup>
            <label>Notification Message</label>
            <TextArea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter your notification message here..."
              rows={5}
              required
            />
          </FormGroup>

          <div className="form-footer">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsNotificationModalOpen(false);
                setNotificationMessage('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Notification
            </Button>
          </div>
        </Form>
      </Modal>
    </Container>
  );
};

export default Users; 