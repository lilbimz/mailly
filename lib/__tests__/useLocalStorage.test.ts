import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial value loading from localStorage', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('default-value');
    });

    it('should load existing value from localStorage on mount', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('stored-value');
    });

    it('should load complex object from localStorage', () => {
      const complexObject = { name: 'John', age: 30, active: true };
      localStorage.setItem('test-key', JSON.stringify(complexObject));
      
      const { result } = renderHook(() => useLocalStorage('test-key', {}));
      
      expect(result.current[0]).toEqual(complexObject);
    });

    it('should load array from localStorage', () => {
      const arrayValue = [1, 2, 3, 4, 5];
      localStorage.setItem('test-key', JSON.stringify(arrayValue));
      
      const { result } = renderHook(() => useLocalStorage('test-key', []));
      
      expect(result.current[0]).toEqual(arrayValue);
    });

    it('should return initial value when localStorage contains corrupted data', () => {
      localStorage.setItem('test-key', 'invalid-json{');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('default-value');
    });

    it('should log warning when localStorage contains corrupted data', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      localStorage.setItem('test-key', 'invalid-json{');
      
      renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading localStorage key "test-key"'),
        expect.any(Error)
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('localStorage updates when value changes', () => {
    it('should update localStorage when value changes', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current[1]('updated');
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
      expect(result.current[0]).toBe('updated');
      
      setItemSpy.mockRestore();
    });

    it('should update state when value changes', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(result.current[0]).toBe('new-value');
    });

    it('should support functional updates', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('counter', 0));
      
      act(() => {
        result.current[1]((prev) => prev + 1);
      });
      
      expect(result.current[0]).toBe(1);
      expect(setItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(1));
      
      setItemSpy.mockRestore();
    });

    it('should support multiple functional updates', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));
      
      act(() => {
        result.current[1]((prev) => prev + 1);
      });
      
      act(() => {
        result.current[1]((prev) => prev + 5);
      });
      
      expect(result.current[0]).toBe(6);
    });

    it('should update localStorage with complex objects', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('user', { name: 'John' }));
      
      const updatedUser = { name: 'Jane', age: 25 };
      act(() => {
        result.current[1](updatedUser);
      });
      
      expect(result.current[0]).toEqual(updatedUser);
      expect(setItemSpy).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
      
      setItemSpy.mockRestore();
    });
  });

  describe('JSON serialization/deserialization', () => {
    it('should serialize and deserialize strings', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', 'hello'));
      
      act(() => {
        result.current[1]('world');
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify('world'));
      expect(result.current[0]).toBe('world');
      
      setItemSpy.mockRestore();
    });

    it('should serialize and deserialize numbers', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', 0));
      
      act(() => {
        result.current[1](42);
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(42));
      expect(result.current[0]).toBe(42);
      
      setItemSpy.mockRestore();
    });

    it('should serialize and deserialize booleans', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', false));
      
      act(() => {
        result.current[1](true);
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(true));
      expect(result.current[0]).toBe(true);
      
      setItemSpy.mockRestore();
    });

    it('should serialize and deserialize null', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage<string | null>('test', null));
      
      act(() => {
        result.current[1](null);
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(null));
      expect(result.current[0]).toBe(null);
      
      setItemSpy.mockRestore();
    });

    it('should serialize and deserialize arrays', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', [] as number[]));
      
      const arrayValue = [1, 2, 3];
      act(() => {
        result.current[1](arrayValue);
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(arrayValue));
      expect(result.current[0]).toEqual(arrayValue);
      
      setItemSpy.mockRestore();
    });

    it('should serialize and deserialize nested objects', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', {}));
      
      const nestedObject = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            zip: '10001'
          }
        },
        active: true
      };
      
      act(() => {
        result.current[1](nestedObject);
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(nestedObject));
      expect(result.current[0]).toEqual(nestedObject);
      
      setItemSpy.mockRestore();
    });

    it('should handle objects with arrays', () => {
      const { result } = renderHook(() => useLocalStorage('test', {}));
      
      const objectWithArray = {
        items: [1, 2, 3],
        tags: ['a', 'b', 'c']
      };
      
      act(() => {
        result.current[1](objectWithArray);
      });
      
      expect(result.current[0]).toEqual(objectWithArray);
    });
  });

  describe('quota exceeded error handling', () => {
    it('should handle QuotaExceededError gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock localStorage.setItem to throw QuotaExceededError
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });
      
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      // State should still update even if localStorage fails
      expect(result.current[0]).toBe('new-value');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('localStorage quota exceeded for key "test"')
      );
      
      consoleErrorSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should update state even when localStorage quota is exceeded', () => {
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });
      
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        result.current[1]('updated');
      });
      
      expect(result.current[0]).toBe('updated');
      
      setItemSpy.mockRestore();
    });

    it('should handle QuotaExceededError with code 22', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Create a plain error object that mimics DOMException with code 22
      const quotaError: any = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      quotaError.code = 22;
      
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });
      
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(result.current[0]).toBe('new-value');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should handle functional updates when quota is exceeded', () => {
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });
      
      const { result } = renderHook(() => useLocalStorage('counter', 0));
      
      act(() => {
        result.current[1]((prev) => prev + 1);
      });
      
      expect(result.current[0]).toBe(1);
      
      setItemSpy.mockRestore();
    });

    it('should log generic errors that are not quota exceeded', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Generic error');
      });
      
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error setting localStorage key "test"'),
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('storage event synchronization', () => {
    it('should update state when storage event is fired', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      // Simulate storage event from another tab
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test',
          newValue: JSON.stringify('updated-from-another-tab'),
          oldValue: JSON.stringify('initial'),
          storageArea: localStorage,
        });
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('updated-from-another-tab');
    });

    it('should not update state for different key', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'different-key',
          newValue: JSON.stringify('updated'),
          oldValue: JSON.stringify('old'),
          storageArea: localStorage,
        });
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('initial');
    });

    it('should handle storage event with null newValue', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test',
          newValue: null,
          oldValue: JSON.stringify('initial'),
          storageArea: localStorage,
        });
        window.dispatchEvent(storageEvent);
      });
      
      // State should remain unchanged when newValue is null
      expect(result.current[0]).toBe('initial');
    });

    it('should handle corrupted data in storage event', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test',
          newValue: 'invalid-json{',
          oldValue: JSON.stringify('initial'),
          storageArea: localStorage,
        });
        window.dispatchEvent(storageEvent);
      });
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error parsing storage event for key "test"'),
        expect.any(Error)
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should cleanup storage event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useLocalStorage('test', 'initial'));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('server-side rendering compatibility', () => {
    it('should return initial value during SSR', () => {
      // Simulate SSR by making window undefined
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const { result } = renderHook(() => useLocalStorage('test', 'default'));
      
      expect(result.current[0]).toBe('default');
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as value', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      
      act(() => {
        result.current[1]('');
      });
      
      expect(result.current[0]).toBe('');
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(''));
      
      setItemSpy.mockRestore();
    });

    it('should handle zero as value', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', 10));
      
      act(() => {
        result.current[1](0);
      });
      
      expect(result.current[0]).toBe(0);
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(0));
      
      setItemSpy.mockRestore();
    });

    it('should handle false as value', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', true));
      
      act(() => {
        result.current[1](false);
      });
      
      expect(result.current[0]).toBe(false);
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify(false));
      
      setItemSpy.mockRestore();
    });

    it('should handle empty array as value', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', [1, 2, 3]));
      
      act(() => {
        result.current[1]([]);
      });
      
      expect(result.current[0]).toEqual([]);
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify([]));
      
      setItemSpy.mockRestore();
    });

    it('should handle empty object as value', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useLocalStorage('test', { a: 1 }));
      
      act(() => {
        result.current[1]({});
      });
      
      expect(result.current[0]).toEqual({});
      expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify({}));
      
      setItemSpy.mockRestore();
    });
  });
});
