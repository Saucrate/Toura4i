import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { theme } from '../styles/theme';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const AddButton = styled(motion.button)`
  background: ${theme.gradients.accent};
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
`;

const AudioCard = styled(motion.div)`
  background: ${theme.colors.background.medium};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${theme.colors.border.light};
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PlayButton = styled(motion.button)`
  background: ${theme.colors.gold};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${theme.colors.text.primary};
`;

const songs = [
  {
    id: 1,
    title: 'ليالي الصحراء',
    artist: 'سيدي ولد حبيب',
    duration: '5:23',
    audio: '/audio/sample1.mp3'
  },
  {
    id: 2,
    title: 'تبراع الشوق',
    artist: 'محمد ولد أحمد',
    duration: '4:15',
    audio: '/audio/sample2.mp3'
  }
];

const Songs = () => {
  const [playing, setPlaying] = React.useState(null);

  return (
    <div>
      <PageHeader>
        <h1 style={{ color: theme.colors.text.primary }}>الأغاني</h1>
        <AddButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus />
          إضافة أغنية
        </AddButton>
      </PageHeader>

      {songs.map((song, index) => (
        <AudioCard
          key={song.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PlayButton
            onClick={() => setPlaying(playing === song.id ? null : song.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {playing === song.id ? <FiPause /> : <FiPlay />}
          </PlayButton>
          
          <div style={{ flex: 1 }}>
            <div className="title">{song.title}</div>
            <div className="artist">{song.artist}</div>
          </div>
          
          <div className="duration">{song.duration}</div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ActionButton whileHover={{ scale: 1.1 }}>
              <FiEdit2 size={18} />
            </ActionButton>
            <ActionButton whileHover={{ scale: 1.1 }}>
              <FiTrash2 size={18} />
            </ActionButton>
          </div>
        </AudioCard>
      ))}
    </div>
  );
};

export default Songs; 