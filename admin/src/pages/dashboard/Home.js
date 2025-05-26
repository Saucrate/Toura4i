import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiBook, FiMusic, FiImage, 
  FiVideo, FiMap, FiMic, FiBookOpen 
} from 'react-icons/fi';
import { getDashboardStats, getRecentActivity } from '../../services/dashboardService';
import { useNotification } from '../../components/common/Notification';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.medium};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color + '20'};
  color: ${({ color }) => color};
`;

const StatInfo = styled.div`
  flex: 1;

  .number {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }

  .label {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
  }
`;

const RecentActivity = styled.div`
  background: ${({ theme }) => theme.colors.background.medium};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.25rem;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.light};

  .content {
    flex: 1;
  }

  .title {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }

  .meta {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
  }

  .time {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.875rem;
  }
`;

const Home = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity()
        ]);
        setStats(statsData.stats);
        setActivities(activitiesData.activities);
      } catch (error) {
        show('حدث خطأ في تحميل البيانات', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [show]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'poem':
        return FiBook;
      case 'album':
        return FiMusic;
      case 'audio':
        return FiMic;
      case 'photo':
        return FiImage;
      case 'video':
        return FiVideo;
      case 'book':
        return FiBookOpen;
      case 'place':
        return FiMap;
      default:
        return FiBook;
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case 'poem':
        return `تمت إضافة قصيدة جديدة: ${activity.title}`;
      case 'album':
        return `تمت إضافة ألبوم جديد: ${activity.title}`;
      case 'audio':
        return `تمت إضافة تسجيل صوتي جديد: ${activity.title}`;
      case 'photo':
        return `تمت إضافة صورة جديدة: ${activity.title}`;
      case 'video':
        return `تمت إضافة فيديو جديد: ${activity.title}`;
      case 'book':
        return `تمت إضافة كتاب جديد: ${activity.title}`;
      case 'place':
        return `تمت إضافة مكان جديد: ${activity.title}`;
      default:
        return activity.title;
    }
  };

  const statsItems = [
    {
      icon: FiUsers,
      color: '#3498db',
      number: stats?.users || 0,
      label: 'المستخدمين'
    },
    {
      icon: FiBook,
      color: '#e67e22',
      number: stats?.poems || 0,
      label: 'القصائد'
    },
    {
      icon: FiMusic,
      color: '#2ecc71',
      number: stats?.albums || 0,
      label: 'الألبومات'
    },
    {
      icon: FiMic,
      color: '#9b59b6',
      number: stats?.audioRecordings || 0,
      label: 'التسجيلات الصوتية'
    },
    {
      icon: FiImage,
      color: '#1abc9c',
      number: stats?.photos || 0,
      label: 'الصور'
    },
    {
      icon: FiVideo,
      color: '#e74c3c',
      number: stats?.videos || 0,
      label: 'الفيديوهات'
    },
    {
      icon: FiBookOpen,
      color: '#f1c40f',
      number: stats?.books || 0,
      label: 'الكتب'
    },
    {
      icon: FiMap,
      color: '#34495e',
      number: stats?.places || 0,
      label: 'الأماكن'
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <div>
      <StatsGrid>
        {statsItems.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IconWrapper color={stat.color}>
              <stat.icon size={24} />
            </IconWrapper>
            <StatInfo>
              <div className="number">{stat.number.toLocaleString('ar-SA')}</div>
              <div className="label">{stat.label}</div>
            </StatInfo>
          </StatCard>
        ))}
      </StatsGrid>

      <RecentActivity>
        <ActivityHeader>
          <h2>النشاطات الأخيرة</h2>
        </ActivityHeader>
        <ActivityList>
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <ActivityItem
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <IconWrapper color="#3498db" style={{ width: 32, height: 32 }}>
                  <Icon size={16} />
                </IconWrapper>
                <div className="content">
                  <div className="title">{getActivityTitle(activity)}</div>
                  {activity.user && (
                    <div className="meta">بواسطة {activity.user}</div>
                  )}
                </div>
                <div className="time">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: ar
                  })}
                </div>
              </ActivityItem>
            );
          })}
        </ActivityList>
      </RecentActivity>
    </div>
  );
};

export default Home; 