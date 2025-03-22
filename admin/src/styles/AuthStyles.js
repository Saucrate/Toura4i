import styled from 'styled-components';
import { motion } from 'framer-motion';

// New color palette
const colors = {
  primary: '#2C3E50',  // Deep blue-gray
  secondary: '#E67E22', // Warm orange
  background: '#1a1a1a',
  text: '#ECF0F1',
  accent: '#3498DB',   // Bright blue
  error: '#E74C3C',    // Red
  success: '#2ECC71',  // Green
  border: 'rgba(236, 240, 241, 0.1)'
};

export const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.background} 100%);
  direction: rtl;
  padding: 20px;
`;

export const AuthCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  border: 1px solid ${colors.border};
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

export const Logo = styled.h1`
  color: #f2f2d3;
  text-align: center;
  font-size: 3rem;
  margin-bottom: 2rem;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 15px 45px 15px 15px;
  color: ${colors.text};
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.accent};
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  &::placeholder {
    color: rgba(236, 240, 241, 0.5);
  }
`;

export const Button = styled(motion.button)`
  background: linear-gradient(45deg, ${colors.secondary}, ${colors.accent});
  border: none;
  border-radius: 12px;
  padding: 15px;
  color: ${colors.text};
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(230, 126, 34, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Link = styled.a`
  color: ${colors.text};
  text-align: center;
  text-decoration: none;
  opacity: 0.8;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    opacity: 1;
    color: ${colors.accent};
  }
`;

export const VerificationInput = styled.input`
  width: 45px;
  height: 55px;
  margin: 0 4px;
  text-align: center;
  font-size: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${colors.border};
  background: rgba(255, 255, 255, 0.05);
  color: ${colors.text};
  font-weight: 600;
  
  &:focus {
    outline: none;
    border-color: ${colors.accent};
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

export const VerificationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 25px 0;
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
`;

export const Step = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? colors.secondary : colors.border};
  transition: all 0.4s ease;
  transform: ${props => props.active ? 'scale(1.2)' : 'scale(1)'};
`;

export const LogoImage = styled.img`
  width: 140px;
  height: auto;
  margin: 0 auto 2rem;
  display: block;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
`;

export const ErrorMessage = styled(motion.p)`
  color: ${colors.error};
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  padding: 10px;
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.1);
`;

export const SuccessMessage = styled(motion.p)`
  color: ${colors.success};
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  padding: 10px;
  border-radius: 8px;
  background: rgba(46, 204, 113, 0.1);
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;

  svg {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.text};
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  ${Input}:focus + svg {
    opacity: 1;
    color: ${colors.accent};
  }
`;

export const FormTitle = styled.h2`
  color: ${colors.text};
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const FormDescription = styled.p`
  color: ${colors.text};
  text-align: center;
  margin-bottom: 2rem;
  opacity: 0.8;
  font-size: 0.95rem;
  line-height: 1.5;
`; 