import styled from 'styled-components';

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
  }
`;

export default CardHeader; 