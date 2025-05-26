import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload, FiLink, FiUser, FiChevronDown } from 'react-icons/fi';
import bookService from '../../services/bookService';
import poetService from '../../services/poetService';
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

    .upload-cover {
      width: 200px;
      height: 300px;
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

const Books = () => {
  const navigate = useNavigate();
  const { show } = useNotification();
  const [books, setBooks] = useState([]);
  const [poets, setPoets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPoetSelectorOpen, setIsPoetSelectorOpen] = useState(false);
  const [poetSearch, setPoetSearch] = useState('');
  const [selectedPoet, setSelectedPoet] = useState(null);

  useEffect(() => {
    loadBooks();
    loadPoets();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await bookService.getAllBooks();
      setBooks(data.books);
    } catch (error) {
      show('حدث خطأ أثناء تحميل الكتب', 'error');
    } finally {
      setLoading(false);
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

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
      try {
        await bookService.deleteBook(id);
        show('تم حذف الكتاب بنجاح', 'success');
        loadBooks();
      } catch (error) {
        show('حدث خطأ أثناء حذف الكتاب', 'error');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        show('يرجى اختيار ملف صورة فقط', 'error');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        show('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile && !editingBook) {
      show('يرجى إضافة صورة الغلاف', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('title', e.target.title.value);
    formData.append('poet', selectedPoet._id);
    formData.append('year', e.target.year.value);
    formData.append('category', e.target.category.value);
    formData.append('description', e.target.description.value);
    formData.append('link', e.target.link.value);
    
    if (imageFile) {
      formData.append('cover', imageFile);
    }

    try {
      if (editingBook) {
        await bookService.updateBook(editingBook._id, formData);
        show('تم تحديث الكتاب بنجاح', 'success');
      } else {
        await bookService.createBook(formData);
        show('تمت إضافة الكتاب بنجاح', 'success');
      }
      
      setIsAddModalOpen(false);
      setEditingBook(null);
      setImageFile(null);
      setImagePreview(null);
      setSelectedPoet(null);
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      show(error.response?.data?.message || 'حدث خطأ أثناء حفظ الكتاب', 'error');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setImagePreview(book.cover);
    if (book.poet) {
      setSelectedPoet({
        _id: book.poet._id,
        name: book.poet.name,
        image: book.poet.image,
        bio: book.poet.bio
      });
    }
    setIsAddModalOpen(true);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.poet && book.poet.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container>
      <Header>
        <Title>الكتب</Title>
        <StyledButton onClick={() => setIsAddModalOpen(true)}>
          <FiPlus />
          إضافة كتاب جديد
        </StyledButton>
      </Header>

      <SearchBar>
        <FiSearch />
        <input
          type="text"
          placeholder="ابحث عن كتاب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>الغلاف</TableHeaderCell>
            <TableHeaderCell>العنوان</TableHeaderCell>
            <TableHeaderCell>الشاعر</TableHeaderCell>
            <TableHeaderCell>السنة</TableHeaderCell>
            <TableHeaderCell>التصنيف</TableHeaderCell>
            <TableHeaderCell>الرابط</TableHeaderCell>
            <TableHeaderCell>الإجراءات</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {filteredBooks.map((book) => (
            <TableRow key={book._id}>
              <TableCell>
                <img
                  src={book.cover}
                  alt={book.title}
                  style={{ width: '50px', height: '70px', objectFit: 'cover' }}
                />
              </TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.poet?.name}</TableCell>
              <TableCell>{book.year}</TableCell>
              <TableCell>{book.category}</TableCell>
              <TableCell>
                {book.link && (
                  <a href={book.link} target="_blank" rel="noopener noreferrer">
                    <FiLink />
                  </a>
                )}
              </TableCell>
              <TableCell>
                <ActionButton onClick={() => handleEdit(book)}>
                  <FiEdit2 />
                </ActionButton>
                <ActionButton
                  color="#ff4444"
                  onClick={() => handleDelete(book._id)}
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
          setEditingBook(null);
          setImagePreview(null);
          setSelectedPoet(null);
        }}
        title={editingBook ? 'تعديل كتاب' : 'إضافة كتاب جديد'}
      >
        <StyledForm onSubmit={handleSubmit}>
          <div className="form-header">
            <div className="upload-cover">
              <img 
                src={imagePreview || editingBook?.cover || '/placeholder-book.jpg'} 
                alt="غلاف الكتاب" 
              />
              <label className="upload-icon" htmlFor="cover-upload">
                <FiUpload />
              </label>
              <input
                id="cover-upload"
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
                defaultValue={editingBook?.title}
                placeholder="عنوان الكتاب"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>اختر الشاعر</label>
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
                        <h4>اختر الشاعر</h4>
                        <p>انقر لاختيار الشاعر</p>
                      </div>
                      <FiChevronDown className="select-icon" />
                    </>
                  )}
                </div>
              </PoetSelector>
            </FormGroup>
          </div>

          <div className="form-grid">
            <FormGroup>
              <label>السنة</label>
              <Input
                name="year"
                type="number"
                defaultValue={editingBook?.year}
                placeholder="سنة النشر"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>التصنيف</label>
              <Select
                name="category"
                defaultValue={editingBook?.category}
                required
              >
                <option value="">اختر التصنيف</option>
                <option value="أدب">أدب</option>
                <option value="تاريخ">تاريخ</option>
                <option value="علوم">علوم</option>
                <option value="فلسفة">فلسفة</option>
              </Select>
            </FormGroup>
          </div>

          <FormGroup>
            <label>الوصف</label>
            <TextArea
              name="description"
              defaultValue={editingBook?.description}
              placeholder="وصف الكتاب..."
              rows={4}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>رابط الكتاب</label>
            <Input
              name="link"
              type="url"
              defaultValue={editingBook?.link}
              placeholder="رابط الكتاب"
              required
            />
          </FormGroup>

          <div className="form-footer">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsAddModalOpen(false);
                setImagePreview(null);
                setSelectedPoet(null);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {editingBook ? 'تحديث الكتاب' : 'إضافة الكتاب'}
            </Button>
          </div>
        </StyledForm>
      </Modal>

      {/* Poet Selector Modal */}
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
    </Container>
  );
};

export default Books; 