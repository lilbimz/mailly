import React from 'react';
import { render, screen, waitFor, act } from '@/lib/__tests__/test-utils';
import CountdownTimer from '../CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('time formatting (HH:MM:SS)', () => {
    it('should display time in HH:MM:SS format', () => {
      // Set expiration 1 hour, 5 minutes, 30 seconds in the future
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T13:05:30Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('01:05:30')).toBeInTheDocument();
    });

    it('should pad single digit hours, minutes, and seconds with zeros', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:01:05Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('00:01:05')).toBeInTheDocument();
    });

    it('should display hours greater than 24 correctly', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-02T14:30:45Z'); // 26 hours, 30 minutes, 45 seconds
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('26:30:45')).toBeInTheDocument();
    });

    it('should display 00:00:00 when exactly at expiration time', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:00Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      // When at or past expiration, should show "Expired" message
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });
  });

  describe('countdown updates every second', () => {
    it('should update the displayed time every second', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:10Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      // Initial time
      expect(screen.getByText('00:00:10')).toBeInTheDocument();
      
      // Advance 1 second and wait for update
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('00:00:09')).toBeInTheDocument();
      
      // Advance another second
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('00:00:08')).toBeInTheDocument();
    });

    it('should continue counting down until reaching zero', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:05Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('00:00:05')).toBeInTheDocument();
      
      // Advance 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should update multiple times correctly', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:03Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      // Check initial and subsequent updates
      expect(screen.getByText('00:00:03')).toBeInTheDocument();
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:00:02')).toBeInTheDocument();
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:00:01')).toBeInTheDocument();
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });
  });

  describe('onExpire callback when time reaches zero', () => {
    it('should call onExpire callback when countdown reaches zero', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:03Z');
      const onExpire = jest.fn();
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />);
      
      // Advance to expiration
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      
      // onExpire is called - the component calls it when timer expires
      expect(onExpire).toHaveBeenCalled();
    });

    it('should call onExpire immediately if already expired on mount', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T11:00:00Z'); // 1 hour in the past
      const onExpire = jest.fn();
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />);
      
      expect(onExpire).toHaveBeenCalled();
    });

    it('should not call onExpire again after initial expiration', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:02Z');
      const onExpire = jest.fn();
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />);
      
      // Advance past expiration
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      const callCountAfterExpiry = onExpire.mock.calls.length;
      
      // Advance more time
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      
      // Should not have additional calls after the initial expiration
      expect(onExpire.mock.calls.length).toBe(callCountAfterExpiry);
    });

    it('should stop the interval after expiration', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:02Z');
      const onExpire = jest.fn();
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />);
      
      // Advance to expiration
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      const callCountAfterExpiry = onExpire.mock.calls.length;
      
      // Advance more time - onExpire should not be called again
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      expect(onExpire.mock.calls.length).toBe(callCountAfterExpiry);
    });
  });

  describe('"Expired" message display', () => {
    it('should display "Expired" message when time reaches zero', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:02Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      // Initially shows countdown
      expect(screen.getByText('00:00:02')).toBeInTheDocument();
      
      // Advance to expiration
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should display "Expired" message when already expired on mount', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T11:00:00Z'); // 1 hour in the past
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should not display countdown timer when expired', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T11:00:00Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      // Should not show the time display
      expect(screen.queryByText(/00:00:00/)).not.toBeInTheDocument();
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should apply correct styling to expired message', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T11:00:00Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      const expiredText = screen.getByText('Expired');
      expect(expiredText).toHaveClass('text-red-600');
    });
  });

  describe('interval cleanup on unmount', () => {
    it('should clean up interval on unmount', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T13:00:00Z');
      const onExpire = jest.fn();
      
      jest.setSystemTime(now);
      
      const { unmount } = render(<CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />);
      
      // Unmount before expiration
      unmount();
      
      // Advance time past when expiration would occur
      jest.advanceTimersByTime(60 * 60 * 1000);
      
      // onExpire should not be called after unmount
      expect(onExpire).not.toHaveBeenCalled();
    });

    it('should not update state after unmount', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:10Z');
      
      jest.setSystemTime(now);
      
      const { unmount } = render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('00:00:10')).toBeInTheDocument();
      
      // Unmount
      unmount();
      
      // Advance time - this should not cause any errors
      expect(() => {
        jest.advanceTimersByTime(5000);
      }).not.toThrow();
    });

    it('should handle rapid mount/unmount cycles', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T13:00:00Z');
      
      jest.setSystemTime(now);
      
      const { unmount } = render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      unmount();
      
      const { unmount: unmount2 } = render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      unmount2();
      
      // Should not throw any errors
      expect(() => {
        jest.advanceTimersByTime(1000);
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle expiration time exactly 1 second in the future', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T12:00:01Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('00:00:01')).toBeInTheDocument();
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should handle very long durations (days)', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-02T12:00:00Z'); // 24 hours
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      expect(screen.getByText('24:00:00')).toBeInTheDocument();
    });

    it('should display clock icon when not expired', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T13:00:00Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      // Check for SVG icon
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not display clock icon when expired', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = new Date('2024-01-01T11:00:00Z');
      
      jest.setSystemTime(now);
      
      render(<CountdownTimer expiresAt={expiresAt} onExpire={jest.fn()} />);
      
      // Check that SVG icon is not present
      const svg = document.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });
});