import { InputHTMLAttributes, forwardRef } from 'react';
import {
  InputWrapper,
  Label,
  StyledInput,
  ErrorText,
  HelperText,
} from './Input.styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <InputWrapper>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <StyledInput
          ref={ref}
          id={inputId}
          $hasError={!!error}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && <ErrorText id={`${inputId}-error`}>{error}</ErrorText>}
        {helperText && !error && (
          <HelperText id={`${inputId}-helper`}>{helperText}</HelperText>
        )}
      </InputWrapper>
    );
  },
);

Input.displayName = 'Input';
