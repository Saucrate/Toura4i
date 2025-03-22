import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiX, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useNotification } from './Notification';

const PlayerContainer = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 340px);
  max-width: 400px;
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 16px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 20px 40px ${({ theme }) => theme.colors.shadow}40;
  border: 2px solid ${({ theme }) => theme.colors.border.light};
  z-index: 100;

  .close-btn {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.error};
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      background: ${({ theme }) => theme.colors.error}ee;
    }
  }

  .cover {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 16px ${({ theme }) => theme.colors.shadow}30;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .info {
    flex: 1;
    min-width: 0;

    h4 {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: 0.125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .album {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;

    .play-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.accent};
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 24px ${({ theme }) => theme.colors.accent}40;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.colors.border.light};
    border-radius: 0 0 16px 16px;
    overflow: hidden;

    .bar {
      height: 100%;
      background: ${({ theme }) => theme.colors.accent};
      transition: width 0.1s linear;
    }
  }

  @media (max-width: 768px) {
    width: calc(100% - 2rem);
    max-width: 320px;
  }
`;

const AudioPlayer = ({ 
  track, 
  isPlaying, 
  progress, 
  onPlayPause, 
  onClose 
}) => {
  const { show } = useNotification();

  return (
    <PlayerContainer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <button className="close-btn" onClick={onClose}>
        <FiX />
      </button>
      <div className="cover">
        <img src={track.albumCover} alt={track.albumTitle} />
      </div>
      <div className="info">
        <h4>{track.title}</h4>
        <div className="album">{track.albumTitle}</div>
      </div>
      <div className="controls">
        <button 
          type="button"
          className="play-btn" 
          onClick={onPlayPause}
        >
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
      </div>
      <div className="progress">
        <div className="bar" style={{ width: `${progress}%` }} />
      </div>
    </PlayerContainer>
  );
};

export default AudioPlayer; 