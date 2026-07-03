import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/platform/testing/test-utils';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeDefined();
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText('Required')).toBeDefined();
  });

  it('shows helper text', () => {
    render(<Input label="Email" helperText="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeDefined();
  });
});
