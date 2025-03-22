import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUsers, FiBook, FiMusic, FiImage } from 'react-icons/fi';

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

const stats = [
  {
    icon: FiUsers,
    color: '#3498db',
    number: '1,234',
    label: 'المستخدمين النشطين'
  },
  {
    icon: FiBook,
    color: '#e67e22',
    number: '856',
    label: 'القصائد'
  },
  {
    icon: FiMusic,
    color: '#2ecc71',
    number: '432',
    label: 'الأغاني'
  },
  {
    icon: FiImage,
    color: '#9b59b6',
    number: '2,198',
    label: 'الصور'
  }
];

const activities = [
  {
    title: 'تمت إضافة قصيدة جديدة',
    user: 'أحمد محمد',
    time: 'منذ 5 دقائق'
  },
  {
    title: 'تم تحديث معلومات المستخدم',
    user: 'فاطمة سالم',
    time: 'منذ 15 دقيقة'
  },
  {
    title: 'تم رفع صور جديدة',
    user: 'محمد أحمد',
    time: 'منذ ساعة'
  }
];

const Home = () => {
  return (
    <div>
      <StatsGrid>
        {stats.map((stat, index) => (
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
              <div className="number">{stat.number}</div>
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
          {activities.map((activity, index) => (
            <ActivityItem
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="content">
                <div className="title">{activity.title}</div>
                <div className="meta">بواسطة {activity.user}</div>
              </div>
              <div className="time">{activity.time}</div>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivity>
    </div>
  );
};

export default Home; 