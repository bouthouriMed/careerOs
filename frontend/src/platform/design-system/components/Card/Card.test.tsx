import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/platform/testing/test-utils';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeDefined();
  });
});
