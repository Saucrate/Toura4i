import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiPlay, FiPause } from 'react-icons/fi';
import { Button, ButtonGroup } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { uploadFile } from '../../utils/fileHelpers';
import { useNotification } from '../../components/common/Notification';

const SongGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const SongCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.medium};
  border-radius: 12px;
  overflow: hidden;
`;

const SongInfo = styled.div`
  padding: 1rem;
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
`;

const AudioPlayer = styled.div`
  background: ${({ theme }) => theme.colors.background.dark};
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PlayButton = styled(motion.button)`
  background: ${({ theme }) => theme.colors.accent};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
`;

const Progress = styled.div`
  flex: 1;
  height: 4px;
  background: ${({ theme }) => theme.colors.border.light};
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: ${({ theme }) => theme.colors.accent};
    border-radius: 2px;
  }
`;

const DeleteConfirmation = styled(motion.div)`
  text-align: center;
  p {
    margin: 1rem 0 2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.light};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.background.medium};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const Songs = () => {
  const [songs, setSongs] = useState([
    {
      id: 1,
      title: 'أغنية تراثية',
      artist: 'فنان تراثي',
      duration: '3:45',
      url: '/track1.mp3',
      thumbnail: '/photo1.jpg'
    },
    {
      id: 2,
      title: 'أغنية تراثية 2',
      artist: 'فنان تراثي 2',
      duration: '4:20',
      url: '/track1.mp3',
      thumbnail: '/photo1.jpg'
    }
  ]);
  const [isPlaying, setIsPlaying] = useState({});
  const [progress, setProgress] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const audioRefs = useRef({});
  const { show } = useNotification();

  const handlePlayPause = (songId) => {
    const audio = audioRefs.current[songId];
    if (isPlaying[songId]) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(prev => ({ ...prev, [songId]: !prev[songId] }));
  };

  const handleTimeUpdate = (songId) => {
    const audio = audioRefs.current[songId];
    const progressValue = (audio.currentTime / audio.duration) * 100;
    setProgress(prev => ({ ...prev, [songId]: progressValue }));
  };

  const handleEdit = (song) => {
    setEditingSong(song);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedSong = {
      ...editingSong,
      title: formData.get('title'),
      artist: formData.get('artist')
    };

    setSongs(prev => prev.map(s => 
      s.id === updatedSong.id ? updatedSong : s
    ));
    setEditingSong(null);
    show('تم تحديث الأغنية بنجاح', 'success');
  };

  const handleDelete = (song) => {
    setSongs(prev => prev.filter(s => s.id !== song.id));
    setDeleteConfirmation(null);
    show('تم حذف الأغنية بنجاح', 'success');
  };

  const handleAddSong = async (file) => {
    try {
      const url = await uploadFile(file, 'audio');
      const newSong = {
        id: Date.now(),
        title: file.name,
        artist: 'فنان جديد',
        duration: '0:00',
        url,
        thumbnail: '/photo1.jpg'
      };
      setSongs(prev => [...prev, newSong]);
      show('تم إضافة الأغنية بنجاح', 'success');
    } catch (error) {
      show('حدث خطأ أثناء رفع الأغنية', 'error');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        id="song-upload"
        onChange={(e) => handleAddSong(e.target.files[0])}
      />
      
      <ButtonGroup>
        <Button as="label" htmlFor="song-upload">
          <FiPlus />
          إضافة أغنية جديدة
        </Button>
      </ButtonGroup>

      <SongGrid>
        {songs.map((song) => (
          <SongCard
            key={song.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SongInfo>
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
              <ButtonGroup>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => handleEdit(song)}
                >
                  <FiEdit2 />
                  تعديل
                </Button>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => setDeleteConfirmation(song)}
                >
                  <FiTrash2 />
                  حذف
                </Button>
              </ButtonGroup>
            </SongInfo>
            <AudioPlayer>
              <PlayButton
                onClick={() => handlePlayPause(song.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying[song.id] ? <FiPause /> : <FiPlay />}
              </PlayButton>
              <Progress progress={progress[song.id] || 0} />
              <span>{song.duration}</span>
            </AudioPlayer>
          </SongCard>
        ))}
      </SongGrid>

      {songs.map(song => (
        <audio
          key={song.id}
          ref={el => audioRefs.current[song.id] = el}
          src={song.url}
          onTimeUpdate={() => handleTimeUpdate(song.id)}
          onEnded={() => setIsPlaying(prev => ({ ...prev, [song.id]: false }))}
        />
      ))}

      <Modal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        title="تأكيد الحذف"
      >
        <DeleteConfirmation>
          <p>هل أنت متأكد من حذف هذه الأغنية؟</p>
          <ButtonGroup>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteConfirmation)}
            >
              نعم، احذف
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmation(null)}
            >
              إلغاء
            </Button>
          </ButtonGroup>
        </DeleteConfirmation>
      </Modal>

      <Modal
        isOpen={!!editingSong}
        onClose={() => setEditingSong(null)}
        title="تعديل الأغنية"
      >
        <Form onSubmit={handleEditSubmit}>
          <FormGroup>
            <label>عنوان الأغنية</label>
            <Input
              name="title"
              defaultValue={editingSong?.title}
              placeholder="أدخل عنوان الأغنية"
              required
            />
          </FormGroup>
          <FormGroup>
            <label>اسم الفنان</label>
            <Input
              name="artist"
              defaultValue={editingSong?.artist}
              placeholder="أدخل اسم الفنان"
              required
            />
          </FormGroup>
          <ButtonGroup align="flex-end">
            <Button type="submit">حفظ التغييرات</Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </div>
  );
};

export default Songs; 