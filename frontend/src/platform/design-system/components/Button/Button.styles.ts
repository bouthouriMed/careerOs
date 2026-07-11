import styled, { css } from 'styled-components';
import { AppTheme } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantStyles = (theme: AppTheme, variant: Variant) => {
  const variants = {
    primary: css`
      background: ${theme.colors.primary};
      color: white;
      border: none;
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    `,
    secondary: css`
      background: ${theme.colors.textSecondary};
      color: white;
      border: none;
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    `,
    ghost: css`
      background: transparent;
      color: ${theme.colors.text};
      border: 1px solid ${theme.colors.border};
      &:hover:not(:disabled) {
        background: ${theme.colors.surfaceHover};
      }
    `,
    danger: css`
      background: ${theme.colors.error};
      color: white;
      border: none;
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    `,
  };
  return variants[variant];
};

const sizeStyles = (size: Size) => {
  const sizes = {
    sm: css`
      padding: 6px 12px;
      font-size: ${({ theme }: { theme: AppTheme }) => theme.typography.sizes.xs};
    `,
    md: css`
      padding: 8px 16px;
      font-size: ${({ theme }: { theme: AppTheme }) => theme.typography.sizes.sm};
    `,
    lg: css`
      padding: 12px 24px;
      font-size: ${({ theme }: { theme: AppTheme }) => theme.typography.sizes.md};
    `,
  };
  return sizes[size];
};

export const StyledButton = styled.button<{ $variant: Variant; $size: Size; $fullWidth: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  white-space: nowrap;

  ${({ theme, $variant }) => variantStyles(theme, $variant)}
  ${({ $size }) => sizeStyles($size)}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}40;
  }
`;
