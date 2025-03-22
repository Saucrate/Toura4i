import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}20;
  }
`;

const TextArea = styled.textarea`
  ${Input}
  resize: vertical;
  min-height: 100px;
`;

const Select = styled.select`
  ${Input}
  appearance: none;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: left 0.75rem center;
  background-size: 1rem;
`;

export { Form, FormGroup, Input, TextArea, Select }; 